git reset
echo ".next" >> .gitignore
echo "node_modules" >> .gitignore
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/spsneh07/unifiedbankingsystem.git
git branch -M main
git push -u origin main
