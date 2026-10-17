"""Offline PNG row-strip experiment. Consume only hash-verified local raster atlas."""
from pathlib import Path
import gzip, hashlib, json, math, struct, zlib
ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "vendor/og-atlas"
OUT = ROOT / "vendor/og-strips"
OUT.mkdir(parents=True, exist_ok=True)
manifest = json.loads((SOURCE / "manifest.json").read_text())
def load(name):
    data = gzip.decompress((SOURCE / (name + '.gz')).read_bytes())
    assert hashlib.sha256(data).hexdigest() == manifest['files'][name]['sha256']
    return data
pool = bytearray()
records = {}
def block(data):
    prior = records.get(data)
    if prior is not None: return prior
    compressor = zlib.compressobj(6, zlib.DEFLATED, -15)
    packed = compressor.compress(data) + compressor.flush(zlib.Z_FULL_FLUSH)
    assert len(data) <= 65535 and len(packed) <= 65535
    offset = len(pool)
    pool.extend(struct.pack('<HHI', len(data), len(packed), zlib.adler32(data)))
    pool.extend(packed)
    records[data] = offset
    return offset
files = {}
def save(name, data):
    compressed = gzip.compress(data, compresslevel=9, mtime=0)
    (OUT / (name+'.gz')).write_bytes(compressed)
    files[name] = {'bytes':len(data), 'sha256':hashlib.sha256(data).hexdigest(), 'gzipBytes':len(compressed), 'gzipSha256':hashlib.sha256(compressed).hexdigest()}
maxcp = 200414
for size in (36,64):
    height = math.ceil(size*1.25)
    glyphs = bytearray(bytes((maxcp+1)*4))
    glyph_dedup = {}
    for page in manifest['pages']:
        bank = load(f'atlas-{size}-{page}.bin')
        for low in range(4096):
            offset,length = struct.unpack_from('<II',bank,8+low*8)
            if not offset: continue
            cp = page*4096+low
            w,h,x,y,advance = struct.unpack_from('<BBbbH',bank,offset)
            width = math.ceil(advance/16)
            alpha = bytearray()
            for at in range(offset+6,offset+length,2): alpha.extend(bytes([bank[at+1]])*bank[at])
            assert len(alpha)==w*h and width<=size
            rows=[]
            for row in range(height):
                pixels=bytearray(bytes([1])*width)
                sy=row-size-y
                if 0<=sy<h:
                    for xx in range(width):
                        sx=xx-x
                        if 0<=sx<w and alpha[sy*w+sx]: pixels[xx]=8+alpha[sy*w+sx]
                rows.append(block(bytes(pixels)))
            record=struct.pack('<HH',width,height)+struct.pack('<'+'I'*height,*rows)
            pointer=glyph_dedup.get(record)
            if pointer is None:
                pointer=len(glyphs);glyphs.extend(record);glyph_dedup[record]=pointer
            struct.pack_into('<I',glyphs,cp*4,pointer)
    save(f'glyphs-{size}.bin',glyphs)
    print('glyphs',size,len(glyphs),'pool',len(pool),'unique rows',len(records),flush=True)
    if size==64:
        # A tiny dark-on-canvas variant only for the numeric salary pill.
        pill={}
        for char in '월 0123456789,만원':
            cp=ord(char);p=struct.unpack_from('<I',glyphs,cp*4)[0]
            width,hh=struct.unpack_from('<HH',glyphs,p)
            rows=[]
            for row in range(hh):
                rp=struct.unpack_from('<I',glyphs,p+4+row*4)[0]
                rawlen,packedlen,adler=struct.unpack_from('<HHI',pool,rp)
                d=zlib.decompressobj(-15);data=d.decompress(pool[rp+8:rp+8+packedlen])
                data=bytes(4 if b==1 else b+32 for b in data)
                rows.append(block(data))
            pill[char]={'width':width,'rows':rows}

templates={}
palettes={}
palette=load('palette.bin')
for name in manifest['files']:
    if not name.startswith('template-'): continue
    kind=name[len('template-'):-len('.bin')]
    raw=load(name)
    if kind=='fun': raw=bytes(0 if b==2 else 1 if b==3 else b-16 if 24<=b<=39 else b for b in raw)
    # Card dynamic spans lie inside the flat portion x=128..1072; salary net x=220..980.
    refs={k:[] for k in ['full','prefix','suffix','pillPrefix','pillSuffix']}
    for y in range(630):
        row=raw[y*1201:(y+1)*1201]
        for key,data in [('full',row),('prefix',row[:129]),('suffix',row[1073:]),('pillPrefix',row[:221]),('pillSuffix',row[981:])]:
            refs[key].append(block(data))
    templates[kind]=refs
    pal=bytearray(palette)
    if kind=='fun':
        pal[0:3]=palette[6:9];pal[3:6]=palette[9:12];pal[24:72]=palette[72:120]
    palettes[kind]=list(pal)
fill={str(value):[block(bytes([value])*length) for length in range(1201)] for value in [1,4]}
save('pool.bin',pool)
config={'version':1,'maxCodepoint':maxcp,'templates':templates,'palettes':palettes,'fill':fill,'pill':pill}
save('config.json',json.dumps(config,separators=(',',':')).encode())
(OUT/'manifest.json').write_text(json.dumps({'version':1,'files':files},indent=2)+'\n')
print(json.dumps({'rawBytes':sum(x['bytes'] for x in files.values()),'gzipBytes':sum(x['gzipBytes'] for x in files.values()),'poolRecords':len(records)}),flush=True)
