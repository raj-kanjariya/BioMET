BioMET '26 Website Template (Static)

How to use
1) Open index.html in a browser (or serve with a local server).
2) Replace the banner:
   - assets/images/banners/hero-banner.jpg (top hero banner)
   - assets/images/banners/inner-banner.jpg (subpage banner)
3) Add people photos:
   - Put headshots in assets/images/people/
   - Ensure filenames match data/people.json (e.g., geetha-manivasagam.jpg)
   - If a photo is missing, the site uses assets/images/people/_placeholder.jpg
4) Add logos:
   - Put logo images in assets/images/logos/
   - Update data/logos.json with file names and URLs
5) Update portal links:
   - registration.html and abstracts.html have buttons where you can paste your portal links.

Tip:
For local development, run:
  python -m http.server 8000
and open http://localhost:8000