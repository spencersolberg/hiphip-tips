# hiphiptips

### Usage

```bash
git clone https://github.com/spencersolberg/hiphip-tips.git
cd hiphiptips
letsdane -o letsdane.crt
hnsd -p 4
```

```bash
letsdane -r 127.0.0.1:5350 -skip-icann -skip-dnssec
```

```
rm .env
deno task setup
deno task test
deno task start
```
