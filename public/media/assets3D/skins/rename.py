import os

def rename_folders(parent_folder):
    res = []
    # Parcourir tous les éléments dans le dossier parent
    for folder_name in os.listdir(parent_folder):
        l =[]
        folder_path = os.path.join(parent_folder, folder_name)
        if os.path.isdir(folder_path):
          for file_name in os.listdir(folder_path):
            file_path = os.path.join(folder_path, file_name)
            if os.path.isfile(file_path):
              l.append(file_name.replace(".png",""))
          res.append(l)
    print(res) 

parent_folder = 'C:/Users/asent/Desktop/S4_Barcelona/VCE/VCE_03/public/media/assets3D/skins/girl'
rename_folders(parent_folder)
