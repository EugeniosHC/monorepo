import { exec } from 'child_process';
import path from 'path';

// Execute the TypeScript file using ts-node
const debugFilePath = path.resolve(__dirname, 'debug-lucide.ts');

exec(`npx ts-node --esm ${debugFilePath}`, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
    }
    console.log(`Output: ${stdout}`);
});
