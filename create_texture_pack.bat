@echo off
set /p "filepath=Drag the PNG file: "
set /p "indexes=Enter the indexes of the materials (get them from indexes.png/.xcf) separated by a coma: "
node texture_pack %filepath% %indexes%