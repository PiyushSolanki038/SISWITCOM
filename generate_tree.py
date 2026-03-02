import os

def generate_tree(startpath, exclude_dirs=['node_modules', '.git', 'dist', 'build', 'coverage', '.vscode', '.idea']):
    tree_str = ""
    # Use current directory name as root
    root_name = os.path.basename(os.path.abspath(startpath))
    tree_str += f"{root_name}/\n"
    
    for root, dirs, files in os.walk(startpath):
        # Filter directories in-place
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        level = root.replace(startpath, '').count(os.sep)
        if level == 0 and root == startpath:
             # Skip the root folder itself in the loop logic as we printed it manually
             pass
        else:
             indent = '  ' * (level)
             tree_str += '{}{}/\n'.format(indent, os.path.basename(root))
        
        subindent = '  ' * (level + 1)
        for f in files:
            if f == 'file-structure.txt': continue # Don't list the output file itself if you want
            if f == 'generate_tree.py': continue
            tree_str += '{}{}\n'.format(subindent, f)
            
    return tree_str

if __name__ == "__main__":
    try:
        content = generate_tree('.')
        with open('file-structure.txt', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Successfully generated file-structure.txt")
    except Exception as e:
        print(f"Error: {e}")
