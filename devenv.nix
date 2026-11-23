{ pkgs, inputs, ... }:

let
  patchmill = inputs.patchmill.packages.${pkgs.stdenv.hostPlatform.system}.patchmill;
in
{
  packages = [
    patchmill
    pkgs.git
    pkgs.gh
    pkgs.procps # pgrep, to check that no Pi processes are left
  ];

  enterShell = ''
    echo "patchmill: $(command -v patchmill)"
    patchmill version
  '';

  scripts.pi-leftovers.exec = ''
    pgrep -af -- '--mode rpc|subagent-runner' || echo "No Pi or subagent processes."
  '';
}
