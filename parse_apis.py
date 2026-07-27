import os
import re
import json

src_dir = '/home/jason-bitega/Desktop/VL/vlearn_repositories/Vlearn_frontend/src'
results = []

pattern = re.compile(r'(apiClient|axios)\.(get|post|put|delete|patch)\((["\'`])(.*?)\3')

for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                for idx, line in enumerate(lines):
                    # Basic matching
                    for match in pattern.finditer(line):
                        method = match.group(2)
                        url = match.group(4)
                        results.append({
                            "file": os.path.relpath(filepath, src_dir),
                            "line": idx + 1,
                            "method": method,
                            "url": url
                        })

# Also try a more lenient regex if it spans lines or doesn't have simple quotes
pattern_lenient = re.compile(r'(apiClient|axios)\.(get|post|put|delete|patch)\(\s*(["\'`])([^"\'`]*?)\3')

# actually let's just use the second pattern
results2 = []
for root, _, files in os.walk(src_dir):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                # we want to find all calls and line numbers
                # line numbers can be found by counting newlines up to match start
                for match in pattern_lenient.finditer(content):
                    method = match.group(2)
                    url = match.group(4)
                    lineno = content.count('\n', 0, match.start()) + 1
                    results2.append({
                        "file": os.path.relpath(filepath, src_dir),
                        "line": lineno,
                        "method": method,
                        "url": url
                    })

with open('api_calls.json', 'w') as f:
    json.dump(results2, f, indent=2)

print(f"Found {len(results2)} API calls.")
