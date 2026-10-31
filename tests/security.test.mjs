import test from 'node:test';
import assert from 'node:assert/strict';
import { publicAddress, validatePublicUrl } from '../scripts/lib/security.mjs';
import { resolveOutputDir } from '../scripts/capture.mjs';
const lookup = async () => [{ address: '93.184.215.14', family: 4 }];
test('public IPs only; rejects special/reserved IPv4 and IPv6', () => {
  assert.equal(publicAddress('8.8.8.8'), true);
  for (const ip of ['127.0.0.1', '10.2.3.4', '172.18.0.1', '192.168.1.1',
     '169.254.169.254', '100.64.1.1', '192.0.2.1', '198.51.100.3',
     '203.0.113.3', '::1', 'fe80::1', '::ffff:127.0.0.1', '2001:db8::1']) {
    assert.equal(publicAddress(ip), false, ip);
  }
});
test('accepts public HTTPS URL with mocked DNS', async () => {
  const url = await validatePublicUrl('https://example.com/pricing?x=1', { lookup });
  assert.equal(url.hostname, 'example.com');
});
test('rejects local, credentialed, non-HTTP, private DNS and alternate ports', async () => {
  for (const url of ['file:///etc/passwd', 'http://localhost', 'http://127.0.0.1',
    'http://[::1]/', 'http://foo.internal/', 'https://u:p@example.com/',
    'https://example.com:8080/', 'javascript:alert(1)', 'not a url']) {
    await assert.rejects(validatePublicUrl(url, { lookup }), url);
  }
  await assert.rejects(validatePublicUrl('https://private.example.com', {
    lookup: async () => [{ address: '8.8.8.8' }, { address: '10.0.0.1' }]
  }));
});
test('writes only inside project output subdirectories', () => {
  assert.match(resolveOutputDir('output/check', 'https://example.com'), /output.check$/);
  for (const value of ['../outside', 'output/../', 'output', '/tmp/private']) {
    assert.throws(() => resolveOutputDir(value, 'https://example.com'));
  }
});
