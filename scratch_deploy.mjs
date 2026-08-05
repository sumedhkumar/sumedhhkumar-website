import { NodeSSH } from 'node-ssh';

const ssh = new NodeSSH();

async function run() {
  await ssh.connect({
    host: '92.249.46.86',
    port: 65002,
    username: 'u239949080',
    password: 'Hostinger@vyntegra2026',
    readyTimeout: 20000
  });
  
  console.log("Connected!");
  
  let result = await ssh.execCommand('pwd; ls -la;');
  console.log('STDOUT: ' + result.stdout);
  console.log('STDERR: ' + result.stderr);
  
  ssh.dispose();
}

run().catch(console.error);
