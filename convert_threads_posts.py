import os
from datetime import datetime, timedelta

input_path = '/Users/kim-young-gwang/Desktop/무제 폴더 2/cosmicpath/docs/marketing/threads-content-30days.md'
output_path = '/Users/kim-young-gwang/Desktop/무제 폴더 2/cosmicpath/docs/marketing/threads-scheduled-posts.md'

def parse_and_convert():
    print(f"Reading from {input_path}...")
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    posts = []
    current_post_lines = []
    in_code_block = False

    # Simple line-by-line parsing to avoid regex hanging
    for line in lines:
        stripped = line.strip()
        
        # Check for code block markers
        if stripped.startswith('```'):
            if in_code_block:
                # End of a block
                in_code_block = False
                if current_post_lines:
                    posts.append("".join(current_post_lines).strip())
                    current_post_lines = []
            else:
                # Start of a block
                in_code_block = True
                current_post_lines = []
            continue
        
        if in_code_block:
            current_post_lines.append(line)

    print(f"Found {len(posts)} posts.")

    # Start date: 2026-01-18 10:00:00
    start_date = datetime(2026, 1, 18, 10, 0, 0)
    
    output_lines = []

    for i, post_content in enumerate(posts):
        post_num = i + 1
        
        # Calculate schedule
        # 10 posts per day.
        day_offset = i // 10
        time_slot = i % 10
        
        # Base date for this batch of 10
        base_date = start_date + timedelta(days=day_offset)
        
        # Add hours for the slot (every 2 hours starting from 10:00)
        post_time = base_date + timedelta(hours=time_slot * 2)
        
        scheduled_at = post_time.strftime('%Y-%m-%d %H:%M')
        
        output_lines.append(f"### 포스트 {post_num}\n")
        output_lines.append("---\n")
        output_lines.append(f"scheduledAt: {scheduled_at}\n")
        output_lines.append("---\n")
        output_lines.append(post_content + "\n\n")
        output_lines.append("---\n\n")

    print(f"Writing {len(output_lines)} lines to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(output_lines)
    
    print("Done.")

if __name__ == "__main__":
    parse_and_convert()
