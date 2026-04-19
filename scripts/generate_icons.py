import os
from PIL import Image

def generate_icons():
    source_path = 'public/assets/urlhub.png'
    if not os.path.exists(source_path):
        print(f"Source image {source_path} not found.")
        return

    icon_sizes = {
        'mipmap-mdpi': 48,
        'mipmap-hdpi': 72,
        'mipmap-xhdpi': 96,
        'mipmap-xxhdpi': 144,
        'mipmap-xxxhdpi': 192
    }

    base_res_path = 'android/app/src/main/res'

    img = Image.open(source_path)

    for folder, size in icon_sizes.items():
        folder_path = os.path.join(base_res_path, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)

        resized_img = img.resize((size, size), Image.Resampling.LANCZOS)

        # Save ic_launcher.png
        resized_img.save(os.path.join(folder_path, 'ic_launcher.png'))
        # Save ic_launcher_round.png
        resized_img.save(os.path.join(folder_path, 'ic_launcher_round.png'))

        print(f"Generated {size}x{size} icons in {folder}")

if __name__ == "__main__":
    generate_icons()
