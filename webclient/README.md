# PCO file server front-end
This the web client application for PCO server labo, built with React & RxJS with a redux approach (but not using the redux library proper)

## Usage
Pour accéder à l’application client, ouvrez simplement le fichier webclient/dist/index.html dans un browser. L’application permet de configurer l’adresse et le port du serveur (http://localhost:1234 par défaut). Expérimentez la vitesse de réaction en chargeant le ficher shakespeare.txt qui contient 5MB des oeuvres de Shakespeare. Pour ce faire, insérez le chemin complet du fichier dans la boîte de texte.

## Build guide
1. Install node.js and npm package manager: https://nodejs.org/en/, or e.g. `sudo apt-get install nodejs`, `sudo apt-get install npm`, `sudo apt-get install nodejs-legacy` (this latter one installs a symlink for `node` command to `nodejs`)
2. Install visual studio code: https://code.visualstudio.com/
3. Run `npm install` in the root directory of this folder, this downloads all dependencies and tools.
4. Run `npm run build` to build the application (this launches webpack behind the scenes) 
5. Run `npm run start` or hit F5 in visual studio code to startup the application: it becomes available on http://localhost:8080 
