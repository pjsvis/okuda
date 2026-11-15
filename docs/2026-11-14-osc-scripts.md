# OSC codes

- Below are some bash commands to set the terminal fg/bg andd cursor via OSC codes
- we can do this in the terminal, but dows it affect other terminals


```bash
# Only emit sequences when attached to an interactive terminal
if [ -t 1 ]; then
  if [ -n "$TMUX" ]; then
    # Wrap in DCS passthrough for tmux
    printf '\033Ptmux;\033\033]10;#ebdbb2\007\033\\'
    printf '\033Ptmux;\033\033]11;#1d2021\007\033\\'
    printf '\033Ptmux;\033\033]12;#fabd2f\007\033\\'
  else
    printf '\033]10;#ebdbb2\007'
    printf '\033]11;#1d2021\007'
    printf '\033]12;#fabd2f\007'
  fi
fi
```