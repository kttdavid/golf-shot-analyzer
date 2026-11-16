a=open('i18n_a.js').read();a=a[:a.index('window.__I18N=')]
b=open('i18n_b.js').read();g=open('glz.js').read().replace('攻果嶺','上果嶺')
js=a+b
js=js.replace("Object.keys(GL).forEach(function(k){var z=GLZ[k];if(!z)return;EX[GL[k][0]]=z[0];","Object.keys(GL).forEach(function(k){var z=GLZ[k];if(!z)return;if(!TN[k])TN[k]=z[3]&&z[3][0]||z[0];EX[GL[k][0]]=z[0];")
js=js.replace(" var c=club(s);if(c!==s)return pre+c;"," var lk=s.toLowerCase();if(s.length<32&&TN[lk])return pre+TN[lk];\n var c=club(s);if(c!==s)return pre+c;")
pass
import os
HERE=os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
p=os.path.join(HERE,'..','..','public','index.html')
s=open(p).read()
i=s.index('<script>\nwindow.GLZ=');j=s.index('</script>\n',i)+len('</script>\n')
s=s[:i]+'<script>\n'+g+'\n'+js+'\n</script>\n'+s[j:]
open(p,'w').write(s);print('ok',len(s))
