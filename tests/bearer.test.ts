import {it,expect} from 'vitest';
import {isAuthorized} from '../src/auth/bearer';
const secret='a'.repeat(32);
const req=(token?:string)=>new Request('https://example.test/mcp', {headers:token?{Authorization:`Bearer ${token}`}:{}});

it('accepts correct bearer token',async()=>{expect(await isAuthorized(req(secret),secret)).toBe(true)});
it('rejects wrong or absent token',async()=>{
 expect(await isAuthorized(req('b'.repeat(32)),secret)).toBe(false);
 expect(await isAuthorized(req(),secret)).toBe(false);
});
it('fails closed without valid configured secret',async()=>{
 expect(await isAuthorized(req(secret),undefined)).toBe(false);
 expect(await isAuthorized(req('short'),'short')).toBe(false);
});
