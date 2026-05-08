import re

with open('src/components/reading/premium-report.tsx', 'r') as f:
    content = f.read()

# Remove !isPremium FreeFocusSection block
content = re.sub(
    r'\{!isPremium && \(\s*<FreeFocusSection[^>]+>\s*\)\}',
    '',
    content,
    flags=re.MULTILINE
)

# Remove isPremium FreeFocusSection block
content = re.sub(
    r'\{isPremium && \(\s*<FreeFocusSection[^>]+>\s*\)\}',
    '',
    content,
    flags=re.MULTILINE
)

with open('src/components/reading/premium-report.tsx', 'w') as f:
    f.write(content)
print("Successfully removed FreeFocusSection.")
