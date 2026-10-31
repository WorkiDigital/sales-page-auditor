import { lookup as dnsLookup } from 'node:dns/promises';
import { isIP } from 'node:net';

/**
 * Verifies a public HTTP(S) target before navigation. Does not pin DNS to the
 * browser socket; use a network egress firewall for hard SSRF isolation.
 */
export function publicAddress(address) {
  let ip = String(address).replace(/^\[|\]$/g, '').toLowerCase();
  const kind = isIP(ip);
  if (kind === 4) {
    const [a, b, c] = ip.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && (b === 168 || b === 0 || b === 88 && c === 99)) return false;
    if (a === 198 && (b === 18 || b === 19 || b === 51 && c === 100)) return false;
    if (a === 203 && b === 0 && c === 113) return false;
    return true;
  }
  if (kind === 6) {
    // Only native globally routable IPv6; exclude IPv4 mapped, local, docs,
    // transition / tunnel and all special-use prefixes.
    if (!/^[23][0-9a-f]{3}:/.test(ip)) return false;
    if (ip.startsWith('2001:db8:') || ip.startsWith('2002:') || ip.startsWith('2001:0000:')) return false;
    return true;
  }
  return false;
}

export async function validatePublicUrl(raw, options = {}) {
  const lookup = options.lookup || dnsLookup;
  if (typeof raw !== 'string' || raw.length > 2048) throw new Error('URL inválida ou muito longa');
  let url;
  try { url = new URL(raw); } catch { throw new Error('URL inválida'); }
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Somente HTTP/HTTPS');
  if (url.username || url.password) throw new Error('Credenciais embutidas não permitidas');
  if (url.port && !['80', '443'].includes(url.port)) throw new Error('Porta não permitida');
  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase().replace(/\.$/, '');
  if (!host || host === 'localhost' || !host.includes('.') && !isIP(host) ||
      /\.(local|localhost|internal|test|invalid)$/i.test(host)) {
    throw new Error('Destino interno ou reservado');
  }
  if (isIP(host)) {
    if (!publicAddress(host)) throw new Error('Endereço IP não público');
  } else {
    let addresses;
    try { addresses = await lookup(host, { all: true, verbatim: true }); }
    catch { throw new Error('DNS não resolvido'); }
    if (!Array.isArray(addresses) || addresses.length === 0 ||
        addresses.some(item => !publicAddress(item.address))) {
      throw new Error('DNS contém endereço não público');
    }
  }
  return url;
}
