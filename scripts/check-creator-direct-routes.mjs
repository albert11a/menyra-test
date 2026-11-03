import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {CREATOR_DIRECT_ROUTES} from '../shared/creator-direct-routes.js';
import {isReservedPublicRouteSegmentCore} from '../apps/menyra-social/core/router/public-business-route-utils.js';

export function checkCreatorDirectRoutes(config, routes) {
  const rewrites=config.rewrites||[];
  for(const [slug,id] of Object.entries(routes)) {
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>100||isReservedPublicRouteSegmentCore(slug)||!/^([a-f0-9]{32})$/.test(id))throw Error(`Invalid Creator route: ${slug}`);
    const path=`/${slug}`,destination=`/api/content-creator?id=${id}`;
    const index=rewrites.findIndex(route=>route.source===path);
    if(index<0||rewrites[index].destination!==destination||rewrites[index].has||rewrites[index].missing)throw Error(`Missing direct Creator rewrite: ${path}`);
    // Our exact rewrite must precede the general public-profile route.
    const catchall=rewrites.findIndex(route=>route.source==='/:landingSlug');
    if(catchall>=0&&index>catchall)throw Error(`Shadowed Creator route: ${path}`);
    for(const route of config.redirects||[])if(route.source===path)throw Error(`Creator route redirects: ${path}`);
  }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  checkCreatorDirectRoutes(JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8')),CREATOR_DIRECT_ROUTES);
  console.log(`Creator direct routes checked (${Object.keys(CREATOR_DIRECT_ROUTES).length}).`);
}
