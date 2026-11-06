class Clutta < Formula
  desc "Monitor whether business workflows reach their expected completion"
  homepage "https://clutta.io"
  version "0.3.0"

  depends_on :macos

  on_arm do
    url "https://github.com/sefastech/clutta-cli-releases/releases/download/v0.3.0/clutta-darwin-arm64"
    sha256 "1a85777f7f644969c5ee79a0d72da8ba2f54b8f98bb723547cba7bfa691679f0"
  end

  on_intel do
    url "https://github.com/sefastech/clutta-cli-releases/releases/download/v0.3.0/clutta-darwin-amd64"
    sha256 "4921911633859de8526a2a715dae09a173cfa8aaf60aeb1e0a34c1d97cec51f7"
  end

  def install
    binary = Hardware::CPU.arm? ? "clutta-darwin-arm64" : "clutta-darwin-amd64"
    bin.install binary => "clutta"
  end

  test do
    assert_match "clutta", shell_output("#{bin}/clutta --help").downcase
  end
end
