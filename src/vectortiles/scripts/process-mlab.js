const fs = require('fs');

const { nest } = require('d3');
const glob = require('glob');
const { default: Queue } = require('p-queue');

const args = process.argv;
const geographicLevel = args[2] || 'counties'; // can also be "tracts"

glob(`mlab/${geographicLevel}/*.json`, async (err, files) => {
  let isFirst = true;
  const output = fs.createWriteStream(`mlab-${geographicLevel}.json`);
  const queue = new Queue({ concurrency: 4 });

  async function processFile(filePath) {
    let delimiter = ',';
    const fipsMatch = filePath.match(/(\d+)\.json$/);
    const fips = fipsMatch ? fipsMatch[1] : null;
    const f = await fs.promises.readFile(filePath);
    const j = JSON.parse(f.toString());

    const grouped = nest()
      .key(d => {
        const { date } = d;
        const [year, month] = date.split('-');
        const halfOfTheYear = ['01', '02', '03', '04', '05', '06'].includes(
          month,
        )
          ? 'jan_jun'
          : 'july_dec';

        return `${year}_${halfOfTheYear}`;
      })
      .entries(j);

    // currently only looks at download speeds
    const analyzed = grouped.map(grouped => {
      const { key, values } = grouped;

      let totalDlSamples = 0;
      let dlSamplesOverAudio = 0;
      let dlSamplesOverVideo = 0;

      values.forEach(v => {
        const { bucket_min, dl_samples } = v;

        totalDlSamples += dl_samples;

        if (bucket_min > 2.5) {
          dlSamplesOverAudio += dl_samples;
        }

        if (bucket_min > 10) {
          dlSamplesOverVideo += dl_samples;
        }
      });

      return {
        [`${key}_total_dl_samples`]: totalDlSamples,
        [`${key}_percent_over_audio_threshold`]:
          dlSamplesOverAudio / totalDlSamples,
        [`${key}_percent_over_video_threshold`]:
          dlSamplesOverVideo / totalDlSamples,
      };
    });

    const d = { geo_id: fips };
    analyzed.forEach(a => {
      Object.assign(d, a);
    });

    if (isFirst) delimiter = '';
    isFirst = false;

    output.write(`${delimiter}\n${JSON.stringify(d)}`);
    console.log(`Processed ${filePath}`);
  }

  output.write('[');
  files.forEach(file => {
    queue.add(() => processFile(file));
  });

  await queue.onIdle();
  output.write(']');

  console.log(`Processed data from ${files.length} source files`);
});
