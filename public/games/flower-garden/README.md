# Flower Garden

Prototype (`nannys-flower-garden.html`) hasn't been ported in yet. Once it
lands, port it the same way as `washing-line/` (it's the other consumer of
`shared/tap-select.js`), then:

- flip its `games.json` entry to `"status": "ready"`
- add its files to the `ASSETS` list in `sw.js`
