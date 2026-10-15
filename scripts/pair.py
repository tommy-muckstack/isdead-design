import sys
from PIL import Image
d,name,out=sys.argv[1:4]
a=Image.open(f'{d}/{name}-1440-orig.png').convert('RGB');b=Image.open(f'{d}/{name}-1440-clone.png').convert('RGB')
h=900;a=a.crop((0,0,1440,min(h,a.height)));b=b.crop((0,0,1440,min(h,b.height)))
W=720;o=Image.new('RGB',(W*2+10,450),'white');o.paste(a.resize((W,int(a.height/2))),(0,0));o.paste(b.resize((W,int(b.height/2))),(W+10,0));o.save(out)
