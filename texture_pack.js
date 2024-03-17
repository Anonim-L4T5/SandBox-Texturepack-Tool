import * as fs from 'fs';
import imageLib from 'png-to-rgba';

const source_path = process.argv[2]
const input_indexes = process.argv[3].split(',').map(elem=>parseInt(elem))

if (!(source_path.length>0))
{
    console.log("No path provided.")
    process.exit()
}
if (!input_indexes)
{
    console.log("No indexes provided.")
    process.exit()
}
if (input_indexes.includes(NaN))
{
    console.log("Incorrect indexes.")
    process.exit()
}

const png = imageLib.default.PNGToRGBAArray(fs.readFileSync(source_path)).png.data.toString('hex')
const exe = fs.readFileSync('sandbox.exe').toString('hex')

//const VersionConstant = 0x118E602*2;
const VersionConstant = 66+exe.indexOf("00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 7F E0 FB FF 7F E0 FB FF 7F E0 FB FF 7F E0 FB FF 7F E0 FB FF 7F E0 FB FF 7F E0 FB FF 7F E0 FB FF 7F E0 FB FF 7F E0 FB FF 7F E0 FB FF 7F E0 FB FF".split(' ').join('').toLowerCase())

const InputIndexes = input_indexes
const InputOffsets = [0,0,0,0,0,0,0]
const ExtraOffsets = InputOffsets.sort((a,b)=>InputIndexes[InputOffsets.indexOf(a)]-InputIndexes[InputOffsets.indexOf(b)])   
const PngIndexes = [...Array(InputIndexes.length).keys()].sort((a,b)=>InputIndexes[a]-InputIndexes[b])
const ImageIndexes = [138,91,53,129,46,24,120].sort((a,b)=>a-b)
const Offsets = ImageIndexes.map(elem => offsetFromIndex(elem))


let mod;

for (let i=0;i<ImageIndexes.length;i++)
{
    if (i==0)
    {
        mod = exe.substring(0,VersionConstant+(ImageIndexes[i])*131072+Offsets[i]+ExtraOffsets[i])
        mod += png.substring(PngIndexes[i]*131072,(PngIndexes[i]+1)*131072)
        console.log("Starting...")
    }
    else if (i==ImageIndexes.length-1)
    {
        mod += exe.substring(VersionConstant+(ImageIndexes[i-1]+1)*131072+Offsets[i-1]+ExtraOffsets[i-1],VersionConstant+(ImageIndexes[i])*131072+Offsets[i]+ExtraOffsets[i])
        mod += png.substring(PngIndexes[i]*131072,(PngIndexes[i]+1)*131072)
        mod += exe.substring(VersionConstant+(ImageIndexes[i]+1)*131072+Offsets[i]+ExtraOffsets[i])
        console.log("Finished!","Size delta:",mod.length-exe.length)
    }
    else {
        mod += exe.substring(VersionConstant+(ImageIndexes[i-1]+1)*131072+Offsets[i-1]+ExtraOffsets[i-1],VersionConstant+(ImageIndexes[i])*131072+Offsets[i]+ExtraOffsets[i])
        mod += png.substring(PngIndexes[i]*131072,(PngIndexes[i]+1)*131072)
    }
}

fs.writeFileSync('sandbox_mod.exe',Buffer.from(mod,'hex'))

function offsetFromIndex(index)
{
    let off = 0
    if (index > 49) off+=7744*8
    if (index > 75) off+=4836*8
    if (index > 100) off+=5330*8
    if (index > 112) off+=256*128*8
    return off
}