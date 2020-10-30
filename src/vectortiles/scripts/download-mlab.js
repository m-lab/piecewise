const { exec: execWithCallback } = require('child_process');

function exec(args) {
  return new Promise((resolve, reject) => {
    execWithCallback(args, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

const { default: Queue } = require('p-queue');

const args = process.argv;
const geographicLevel = args[2] || 'counties'; // can also be "tracts"
const rootGsUrl = `gs://statistics-mlab-sandbox/v0/NA/US/${geographicLevel}`;

async function download(fips) {
  const cmd = `gsutil cp ${rootGsUrl}/${fips}/2020/histogram_daily_stats.json mlab/${geographicLevel}/${fips}.json`;
  try {
    console.log(`Downloading JSON file (FIPS: ${fips})`);
    await exec(cmd);
  } catch (e) {
    console.error(`Error with ${fips}\n\t`, e);
  }
}

async function main() {
  const filesList = await exec(`gsutil ls ${rootGsUrl}/`);
  const files = filesList.split('\n');

  const queue = new Queue({ concurrency: 4 });
  const fipsLength = geographicLevel === 'counties' ? '5' : '11';
  const r = new RegExp(`${geographicLevel}\\/(\\d{${fipsLength}})\\/$`);

  files.forEach(file => {
    const match = file.match(r);
    if (!match) return;

    const fips = match[1];
    queue.add(() => download(fips));
  });

  await queue.onIdle();

  console.log(`Downloaded ${files.length} JSON files`);
}

main();
