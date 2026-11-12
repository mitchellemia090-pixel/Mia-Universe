from pathlib import Path
import re
p=Path('integrated-v2/index.html');s=p.read_text(encoding='utf8');s=re.sub(r'<noscript>.*?</noscript>','<noscript><p>Enable JavaScript to explore the portfolio.</p></noscript>',s);p.write_text(s,encoding='utf8')
# Preserve lazy loading for all below-the-fold images in reading editions.
for p in Path('integrated-v2/works-content').glob('*'):
 if p.suffix not in ('.js','.json'):continue
 s=p.read_text(encoding='utf8');s=s.replace('<img src=', '<img loading=\\"lazy\\" decoding=\\"async\\" src=')
 p.write_text(s,encoding='utf8')
