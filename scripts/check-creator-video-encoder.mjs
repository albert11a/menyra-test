import {execFileSync} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

// Fail the build rather than publishing a function whose encoder was skipped
// by npm's dependency-script policy or omitted from the installed platform.
try{
 const encoders=execFileSync(ffmpeg,['-hide_banner','-encoders'],{encoding:'utf8',timeout:10000,stdio:['ignore','pipe','pipe']});
 if(!encoders.includes('libx264'))throw Error('H.264 encoder missing');
 console.log('Creator video encoder ready (H.264).');
}catch{
 throw Error('Creator video encoder missing. Install the approved ffmpeg-static dependency scripts before building.');
}
