#!/bin/bash
for f in $(find node_modules -wholename "*/android/*.java");
do
   cat androidxNodeModuleReplaceList.txt| while read line || [ -n   "$line" ]
   do
      if grep -q $(echo $line | sed 's/\/.*//') $f;
         then
         sed s/$line/g $f > $f.new && mv $f.new $f
         echo "$f >> $line \n"
      fi
   done
done