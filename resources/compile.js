import { spawn, fs, exepath } from '@sys';
import { home } from '@env';
import { encode } from '@sciter';

export async function compile(app) {
  if (!fs.$stat(home(['your-game']))) {
    await fs.mkdir(home(['your-game']));
  }

  const bin = await (await fetch('packfolder.exe')).arrayBuffer();
  const file = await fs.open(home(['your-game/packfolder.exe']), 'w');
  await file.write(bin);
  await file.close();

  if (!fs.$stat(home(['your-game/resources']))) {
    await fs.mkdir(home(['your-game/resources']));
  }

  if (!fs.$stat(home(['your-game/resources/assets']))) {
    await fs.mkdir(home(['your-game/resources/assets']));
  }

  if (!fs.$stat(home(['assets']))) {
    await fs.mkdir(home(['assets']));
  }

  if (!fs.$stat(home(['tick-code.js']))) {
    fs.$open(home(['tick-code.js']), 'a').$close();
  }

  if (!fs.$stat(home(['paint-code.js']))) {
    fs.$open(home(['paint-code.js']), 'a').$close();
  }

  await copyRecursive(
    home(['assets']),
    home(['your-game/resources/assets'])
  );

  await fs.copyfile(home(['tick-code.js']), home([`your-game/resources/tick-code.js`]));
  await fs.copyfile(home(['paint-code.js']), home([`your-game/resources/paint-code.js`]));

  const folders = ['.', 'about', 'game', 'toolbar', 'metadata'];

  for (const folder of folders) {

    const path = home([`your-game/resources/${folder}`]);
    if (!fs.$stat(path)) {
      await fs.mkdir(path);
    }

    let filenames = [];

    switch (folder) {
      case '.': {
        filenames = ['main.htm', 'main.js', 'main.css', 'eval.js'];
        break;
      }
      case 'about': {
        filenames = ['about.htm', 'about.js', 'about.css', 'sciter.png'];
        break;
      }
      case 'game': {
        filenames = ['game.js', 'game.css'];
        break;
      }
      case 'toolbar': {
        filenames = ['toolbar.js', 'toolbar.css', 'checkmark.png', 'compile.png', 'pause.png', 'play.png', 'restart.png'];
        break;
      }
      case 'metadata': {
        filenames = ['metadata.htm', 'metadata.js', 'metadata.css'];
        break;
      }
    }


    //const filenames = fs.$readdir(home([`your-game/resources/${folder}`]))
    //const filenames = fs.$readdir(`../resources/${folder}`)
      //.filter(file => file.type & fs.UV_DIRENT_FILE)
      //.map(file => file.name);

    const promises = filenames.map(async filename => {

      if ([
        'compile.js',
        'packfolder.exe',
      ].includes(filename)) {
        return;
      }

      if (filename.endsWith('.htm') || filename.endsWith('.html') || filename.endsWith('.js')) {
        let text = await (await fetch(`${folder}/${filename}`)).text();
        text = text.replace(/.*\/\/ debugging$/gm, '');
        text = text.replace(/<menu \.window>.*<\/menu>/gms,
          `<menu .window>
           <li>
        Help
        <menu (help)>
          <li (about)>About&hellip;</li>
        </menu>
      </li>
      </menu>`
        );
        text = text.replace('<title>GameScripter.JS</title>', `<title>${app.metadata.productName}</title>`);
        const file = await fs.open(`${path}/${filename}`, 'w');
        await file.write(encode(text));
        await file.close();
      } else {
        const bin = await (await fetch(`${folder}/${filename}`)).arrayBuffer();
        const file = await fs.open(`${path}/${filename}`, 'w');
        await file.write(bin);
        await file.close();
      }
    });

    await Promise.all(promises);
  }

  const packfolder = spawn([
    home(['your-game/packfolder.exe']),
    home(['your-game/resources']),
    home(['your-game/data.dat']),
    '-binary',
  ]);

  await packfolder.wait();

  await Window.this.scapp.assembleExe(
    exepath(),
    home(['your-game/data.dat']),
    home([`your-game/${app.metadata.productName}.exe`]),
    app.metadata
  );

  const foldersToDelete = [
    home(['your-game/resources'])
  ];

  const filesToDelete = [
    home(['your-game/packfolder.exe']),
    home(['your-game/data.dat'])
  ];

  await Promise.all(filesToDelete.map(fs.unlink));
  await deleteFolderRecursive(home(['your-game/resources']));
}

const path = {
  join: function (path1, path2) {
    return `${path1}/${path2}`.replace(/[\/\\]+/g, '/');
  }
}

async function copyRecursive(src, dest) {
  const exists = !!fs.$stat(src);
  const stats = exists && await fs.stat(src);
  const isDirectory = exists && stats.isDirectory;
  if (isDirectory) {
    if (!fs.$stat(dest)) await fs.mkdir(dest);
    const promises = fs.$readdir(src).map(async ({ name }) => {
      await copyRecursive(
        path.join(src, name),
        path.join(dest, name)
      );
    });
    await Promise.all(promises);
  } else {
    await fs.copyfile(src, dest);
  }
};

async function deleteFolderRecursive(directoryPath) {
  console.log(`deleting recursively: ${directoryPath}`);
  if (fs.$stat(directoryPath)) {
    console.log(`does exist: ${directoryPath}`)

    for (const file of fs.$readdir(directoryPath)) {
    //fs.$readdir(directoryPath).forEach((file) => {
      const curPath = path.join(directoryPath, file.name);
      console.log(`current path: ${curPath}`);
      if (fs.$lstat(curPath).isDirectory) {
        console.log(`is directory: ${curPath}`);
        // recurse
        await deleteFolderRecursive(curPath);
      } else {
        console.log(`is file (deleting): ${curPath}`);
        // delete file
        await fs.unlink(curPath);
      }
    }
    console.log(`deleting now empty folder: ${directoryPath}`);
    try {
      await fs.rmdir(directoryPath);
      //fs.$rmdir(directoryPath);
    } catch (e) {
      console.log(`failed to delete folder ${directoryPath}`);
      console.log(e);
    }
  }
};