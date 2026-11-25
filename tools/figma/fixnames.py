import json,sys
AV={'pic-hat.webp':'Аватар: шляпа','pic-flower.webp':'Аватар: цветок','pic-sneakers.webp':'Аватар: кроссовки','pic-balloons.webp':'Аватар: шары','pic-cart.webp':'Аватар: тележка','timur-avatar.webp':'Фото Тимура'}
AV2={'Сообщение:':'Скриншот отзыва'}
CNT=[0]
def fix(n,w,parent=None):
    if n.get('t')=='f' and n.get('n') in ('i','qa-ic'): n['n']='Точка' if abs(n['w']-n['h'])<1 else ('Минус' if n['w']>n['h'] else 'Плюс')
    if n.get('t')=='i' and n.get('n') in AV: n['n']=AV[n['n']]
    if n.get('t')=='i' and n.get('n','').endswith('.webp'): n['n']='Картинка: '+n['n'].replace('.webp','')
    if n.get('t')=='i' and n.get('n','').startswith('Сообщение:'): CNT[0]+=1; n['n']=f'Скриншот отзыва {CNT[0]}'
    if n.get('t')=='x' and n.get('ind'):
        n['ind']=round(parent['w']*n['ind']/100) if parent else 0
    for c in n.get('ch',[]): fix(c,w,n)
for f in sys.argv[1:]:
    CNT=[0]
    d=json.load(open(f)); w=int(f.split('_')[1])
    for n in d['nodes']: fix(n,w)
    json.dump(d,open(f,'w'),ensure_ascii=False,separators=(',',':'))
