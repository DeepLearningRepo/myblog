"""Run the Argos Chinese-to-English model locally; article text stays on this host."""
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import urllib.request
import zipfile

MODEL_URL = "https://argos-net.com/v1/translate-zh_en-1_9.argosmodel"
MODEL_SHA256 = "62e7af5a3a48b530e47b7b3e5c78c2de79073ecd815750d2bf3ab35b4a67da2d"
GLOSSARY = {
    "逻辑张量": "logical tensor", "物理张量": "physical tensor", "布局代数": "layout algebra",
    "存储偏移": "storage offset", "逻辑索引": "logical index", "物理存储": "physical storage",
    "深度学习": "deep learning", "张量": "tensor", "张亮": "tensor", "线程": "thread",
    "并发": "parallelism", "步长": "stride", "下标": "index", "稠密": "dense",
}


def model_directory():
    root = Path(os.environ.get("TRANSLATION_MODEL_DIR", ".translation-models")).resolve()
    root.mkdir(parents=True, exist_ok=True)
    ready = root / "ready.json"
    if ready.exists():
        folder = root / json.loads(ready.read_text())["folder"]
        if (folder / "model").is_dir():
            return folder
    archive = root / "translate-zh_en-1_9.argosmodel"
    if not archive.exists():
        initial = Path("translate-zh_en-1_9.argosmodel")
        if initial.exists():
            initial.rename(archive)
        else:
            temporary = archive.with_suffix(".download")
            print("Downloading the Chinese-to-English model (71 MB)...", file=sys.stderr)
            with urllib.request.urlopen(MODEL_URL, timeout=180) as response, temporary.open("wb") as output:
                while chunk := response.read(1024 * 1024):
                    output.write(chunk)
            temporary.rename(archive)
    checksum = hashlib.sha256(archive.read_bytes()).hexdigest()
    if checksum != MODEL_SHA256:
        raise RuntimeError("Translation model checksum does not match")
    with zipfile.ZipFile(archive) as package:
        for item in package.infolist():
            if not (root / item.filename).resolve().is_relative_to(root):
                raise RuntimeError("Invalid model archive path")
        package.extractall(root)
    metadata = next(root.glob("*/metadata.json"))
    ready.write_text(json.dumps({"folder": metadata.parent.name, "sha256": checksum}))
    return metadata.parent


def main():
    import ctranslate2
    import sentencepiece

    payload = json.load(sys.stdin)
    folder = model_directory()
    metadata = json.loads((folder / "metadata.json").read_text())
    tokenizer = sentencepiece.SentencePieceProcessor(model_file=str(folder / "sentencepiece.model"))
    translator = ctranslate2.Translator(str(folder / "model"), device="cpu", compute_type="int8", inter_threads=1, intra_threads=min(4, os.cpu_count() or 1))
    output = []
    for text in payload["texts"]:
        for original, term in sorted(GLOSSARY.items(), key=lambda item: -len(item[0])):
            text = text.replace(original, f" {term} ")
        # Bound sentence lengths before tokenization so long Markdown paragraphs are not truncated.
        sentences = [part for part in re.split(r"(?<=[。！？；])", text) if part]
        bounded = [part[offset:offset + 240] for part in sentences for offset in range(0, len(part), 240)]
        tokens = [tokenizer.encode(part, out_type=str) for part in bounded]
        prefix = metadata.get("target_prefix", "")
        batches = translator.translate_batch(tokens, target_prefix=[[prefix]] * len(tokens) if prefix else None, beam_size=4, replace_unknowns=True, max_input_length=512, max_decoding_length=1024, length_penalty=0.2)
        result = " ".join(tokenizer.decode(batch.hypotheses[0]).replace("▁", " ").removeprefix(prefix).strip() for batch in batches).strip()
        result = re.sub(r"[ \t]+", " ", result)
        if not result:
            raise RuntimeError("Model returned an empty translation")
        output.append(result)
    json.dump({"texts": output}, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
