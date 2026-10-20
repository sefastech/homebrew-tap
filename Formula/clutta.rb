class Clutta < Formula
  desc "Monitor whether business workflows reach their expected completion"
  homepage "https://clutta.io"
  version "0.2.24"

  depends_on :macos

  on_arm do
    url "https://github.com/sefastech/clutta-cli-releases/releases/download/v0.2.24/clutta-darwin-arm64"
    sha256 "aa9fb497b6779bd635416fa4382f177861d3be8361e0eef522b43451bbe025d7"
  end

  on_intel do
    url "https://github.com/sefastech/clutta-cli-releases/releases/download/v0.2.24/clutta-darwin-amd64"
    sha256 "d3432da128659981aa7101b361a8c85432b576eb3724fabda27a518c3400917a"
  end

  def install
    binary = Hardware::CPU.arm? ? "clutta-darwin-arm64" : "clutta-darwin-amd64"
    bin.install binary => "clutta"
  end

  test do
    assert_match "clutta", shell_output("#{bin}/clutta --help").downcase
  end
end
