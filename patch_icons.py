import re

with open('constants.tsx', 'r') as f:
    content = f.read()

# Replace (): with ({ className }: { className?: string } = {}): inside Icons object
content = re.sub(r'(\w+):\s*\(\)\s*=>\s*\(\s*<svg className="[w0-9\-\s]*"', r'\1: ({ className }: { className?: string } = {}) => (\n    <svg className={className || "w-5 h-5"}', content)

with open('constants.tsx', 'w') as f:
    f.write(content)

print("Icons patched successfully.")
