import { OUTPUT_PATH } from './report-test-data/cases.ts';
import { writeBaselineArtifacts } from './report-baseline/writer.ts';

function main() {
  const index = writeBaselineArtifacts(OUTPUT_PATH);
  console.log(`wrote ${index.artifactDir}`);
  console.log(`index=${index.artifactDir}/index.json`);
  console.log(`cases=${index.cases.map((item) => item.id).join(',')}`);
}

main();
