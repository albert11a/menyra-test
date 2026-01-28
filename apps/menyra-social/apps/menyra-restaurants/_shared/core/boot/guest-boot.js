import {getContext,requireRestaurant} from '../context.js'; export const guestBoot=()=>{const ctx=getContext();return {ctx,ok:requireRestaurant(ctx)}};
