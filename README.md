# Usman Qayyum — qayyumu.github.io

Personal site for [Usman Qayyum](https://qayyumu.github.io): CTO, AI researcher, and robotics scientist.

## Local preview

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```

Then visit http://localhost:8080

## Publish to GitHub Pages

1. Create a public repository named **`qayyumu.github.io`** on GitHub (under user `qayyumu`).
2. From this folder:

```bash
git init
git add .
git commit -m "Initial personal site for qayyumu.github.io"
git branch -M main
git remote add origin git@github.com:qayyumu/qayyumu.github.io.git
git push -u origin main
```

3. In the repo settings, confirm GitHub Pages is serving from the `main` branch root.
4. Site URL: https://qayyumu.github.io
