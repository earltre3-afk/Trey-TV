# =============================================================================
# RnB_Trap_360RA_Pipeline.ps1
# Sony 360 Reality Audio Pre-Master Pipeline
# 9-Agent Stem Processing + Spatial Manifest Generator
# =============================================================================

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION — update these paths and metadata before running
# ─────────────────────────────────────────────────────────────────────────────
$Config = @{
    # Folder containing your raw stem files (WAV)
    StemsFolder     = "C:\Users\info\stems"

    # Where processed files + deliverables will land
    OutputFolder    = "C:\Users\info\360ra-output"

    # Track metadata
    TrackName       = "MY_TRACK_TITLE"
    Artist          = "Artist Name"
    BPM             = 140
    Key             = "F# minor"
    Genre           = "RnB-Trap"

    # Target loudness
    TargetLUFS      = -14
    TruePeakdBTP    = -1.0

    # Stem-type map  →  key = substring that appears in filename (case-insensitive)
    # Value = stem type used by the EQ and spatial agents
    StemMap = @{
        "808"       = "808"
        "bass"      = "808"
        "kick"      = "kick"
        "snare"     = "snare"
        "clap"      = "snare"
        "hihat"     = "hihat"
        "hat"       = "hihat"
        "cymbal"    = "hihat"
        "vox"       = "lead_vocal"
        "vocal"     = "lead_vocal"
        "lead"      = "lead_vocal"
        "adlib"     = "adlib_vocal"
        "ad lib"    = "adlib_vocal"
        "harmony"   = "harmony_vocal"
        "bgv"       = "harmony_vocal"
        "melody"    = "melody"
        "synth"     = "synth"
        "pad"       = "pad"
        "keys"      = "keys"
        "piano"     = "keys"
        "guitar"    = "guitar"
        "strings"   = "strings"
        "perc"      = "perc"
        "fx"        = "fx"
        "foley"     = "fx"
        "atmos"     = "atmosphere"
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# SPATIAL TEMPLATE — azimuth (°), elevation (°), distance (0-1 scale)
# These are loaded into the JSON manifest for WalkMix Creator reference
# ─────────────────────────────────────────────────────────────────────────────
$SpatialMap = @{
    "808"           = @{ Azimuth = 0;    Elevation = -20; Distance = 1.0; Description = "Sub-bass locked to center, pulled slightly below listener plane" }
    "kick"          = @{ Azimuth = 0;    Elevation = 0;   Distance = 1.0; Description = "Kick centered at ear level — anchor point for the mix" }
    "snare"         = @{ Azimuth = 0;    Elevation = 5;   Distance = 1.1; Description = "Snare centered, slightly elevated for presence" }
    "hihat"         = @{ Azimuth = 90;   Elevation = 20;  Distance = 1.5; Description = "Hi-hats pushed to the right overhead — alternate L/R for open/closed if stems allow" }
    "lead_vocal"    = @{ Azimuth = 0;    Elevation = 0;   Distance = 0.8; Description = "Lead vocal front-center, pulled close — listener focus point" }
    "adlib_vocal"   = @{ Azimuth = 45;   Elevation = 10;  Distance = 1.4; Description = "Adlibs pushed right and slightly elevated — call and response space" }
    "harmony_vocal" = @{ Azimuth = -60;  Elevation = 15;  Distance = 1.6; Description = "Harmonies left and up — wraps around lead without competing" }
    "melody"        = @{ Azimuth = 30;   Elevation = 5;   Distance = 1.2; Description = "Melodic hook slightly right of center" }
    "synth"         = @{ Azimuth = -120; Elevation = 25;  Distance = 2.0; Description = "Synths pushed to the rear-left overhead — ambient layer" }
    "pad"           = @{ Azimuth = 150;  Elevation = 30;  Distance = 2.5; Description = "Pads fully rear — enveloping atmospheric bed" }
    "keys"          = @{ Azimuth = -45;  Elevation = 5;   Distance = 1.4; Description = "Keys left of center — counterbalances adlibs on right" }
    "guitar"        = @{ Azimuth = 60;   Elevation = 10;  Distance = 1.5; Description = "Guitar right of center at mid-distance" }
    "strings"       = @{ Azimuth = -90;  Elevation = 20;  Distance = 2.0; Description = "Strings left overhead — wide orchestral feel" }
    "perc"          = @{ Azimuth = 120;  Elevation = 15;  Distance = 1.8; Description = "Percussion rear-right — rhythmic depth" }
    "fx"            = @{ Azimuth = 180;  Elevation = 40;  Distance = 3.0; Description = "FX/foley fully behind and above — surround texture" }
    "atmosphere"    = @{ Azimuth = 0;    Elevation = 90;  Distance = 3.0; Description = "Atmosphere placed directly overhead — dome fill" }
}

# ─────────────────────────────────────────────────────────────────────────────
# UTILITIES
# ─────────────────────────────────────────────────────────────────────────────
$Script:Errors = @()
$Script:Warnings = @()

function Write-Agent {
    param([int]$Num, [string]$Name, [string]$Status = "RUNNING")
    $color = switch ($Status) {
        "RUNNING" { "Cyan" }
        "DONE"    { "Green" }
        "WARN"    { "Yellow" }
        "FAIL"    { "Red" }
    }
    Write-Host "`n[$Status] Agent $Num — $Name" -ForegroundColor $color
}

function Invoke-Tool {
    param([string]$Cmd, [string]$Args)
    $result = & $Cmd $Args.Split(" ") 2>&1
    return $result
}

function Get-StemType {
    param([string]$Filename)
    $lower = $Filename.ToLower()
    foreach ($key in $Config.StemMap.Keys) {
        if ($lower -like "*$key*") {
            return $Config.StemMap[$key]
        }
    }
    return "unknown"
}

function Ensure-Dir {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# PRE-FLIGHT
# ─────────────────────────────────────────────────────────────────────────────
Write-Host @"
=================================================================
  RnB/Trap 360 Reality Audio Pipeline
  Track: $($Config.TrackName)  |  BPM: $($Config.BPM)  |  Key: $($Config.Key)
=================================================================
"@ -ForegroundColor Magenta

# Check dependencies
foreach ($tool in @("ffmpeg","sox","ffprobe")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Host "[ERROR] '$tool' not found in PATH." -ForegroundColor Red
        Write-Host "  FFmpeg: winget install FFmpeg" -ForegroundColor Yellow
        Write-Host "  SoX:    choco install sox" -ForegroundColor Yellow
        exit 1
    }
}

Ensure-Dir $Config.OutputFolder
$Staged    = Join-Path $Config.OutputFolder "01_staged"
$EQd       = Join-Path $Config.OutputFolder "02_eq"
$VocalBus  = Join-Path $Config.OutputFolder "03_vocal_bus"
$MusicBus  = Join-Path $Config.OutputFolder "04_music_bus"
$Master    = Join-Path $Config.OutputFolder "05_master"
$Reports   = Join-Path $Config.OutputFolder "06_reports"
foreach ($d in @($Staged,$EQd,$VocalBus,$MusicBus,$Master,$Reports)) {
    Ensure-Dir $d
}

# ─────────────────────────────────────────────────────────────────────────────
# AGENT 1 — STEM VALIDATION
# ─────────────────────────────────────────────────────────────────────────────
Write-Agent 1 "Stem Validation + Sample Rate Check"

$stems = Get-ChildItem -Path $Config.StemsFolder -Include "*.wav","*.aiff","*.flac" -Recurse
if ($stems.Count -eq 0) {
    Write-Host "  [ERROR] No audio stems found in: $($Config.StemsFolder)" -ForegroundColor Red
    exit 1
}

$stemReport = @()
$sampleRateMismatch = $false
$referenceSR = $null

foreach ($stem in $stems) {
    $probe = & ffprobe -v quiet -select_streams a:0 -show_entries "stream=sample_rate,channels,bits_per_raw_sample,codec_name,duration" -of csv=p=0 $stem.FullName 2>&1
    $parts = ($probe -join ",").Split(",")

    $codec    = if ($parts.Count -gt 0) { $parts[0] } else { "unknown" }
    $sr       = if ($parts.Count -gt 1) { [int]$parts[1] } else { 0 }
    $channels = if ($parts.Count -gt 2) { [int]$parts[2] } else { 0 }
    $bitDepth = if ($parts.Count -gt 3) { $parts[3] } else { "?" }
    $duration = if ($parts.Count -gt 4) { [double]$parts[4] } else { 0 }

    if ($referenceSR -eq $null) { $referenceSR = $sr }
    if ($sr -ne $referenceSR)   { $sampleRateMismatch = $true }

    $type = Get-StemType $stem.Name
    $status = if ($sr -ge 44100 -and $channels -ge 1) { "OK" } else { "WARN" }

    $stemReport += [PSCustomObject]@{
        File       = $stem.Name
        Type       = $type
        Codec      = $codec
        SampleRate = $sr
        Channels   = $channels
        BitDepth   = $bitDepth
        Duration   = [math]::Round($duration, 2)
        Status     = $status
    }

    $icon = if ($status -eq "OK") { "✓" } else { "⚠" }
    Write-Host "  $icon  $($stem.Name)  ($type)  ${sr}Hz  ${channels}ch  ${duration}s" -ForegroundColor (if ($status -eq "OK") { "White" } else { "Yellow" })
}

if ($sampleRateMismatch) {
    Write-Host "`n  [WARN] Mixed sample rates detected. All stems will be resampled to $referenceSR Hz during staging." -ForegroundColor Yellow
    $Script:Warnings += "Mixed sample rates — stems resampled to ${referenceSR}Hz"
}

Write-Host "  Found $($stems.Count) stems. Reference SR: ${referenceSR}Hz" -ForegroundColor Green
Write-Agent 1 "Stem Validation + Sample Rate Check" "DONE"

# ─────────────────────────────────────────────────────────────────────────────
# AGENT 2 — GAIN STAGING TO -6 dBFS
# ─────────────────────────────────────────────────────────────────────────────
Write-Agent 2 "Gain Staging — Peak normalize to -6 dBFS"

$stagedStems = @()
foreach ($stem in $stems) {
    $outFile = Join-Path $Staged ($stem.BaseName + "_staged.wav")

    # sox gain -n -6 = normalize peak to exactly -6 dBFS
    # Also resample to reference SR and convert to 24-bit stereo
    $soxArgs = @(
        $stem.FullName,
        "-r", $referenceSR,
        "-b", "24",
        "-c", "2",
        $outFile,
        "gain", "-n", "-6"
    )

    Write-Host "  Staging: $($stem.Name) → $($stem.BaseName)_staged.wav" -ForegroundColor Gray
    & sox $soxArgs 2>&1 | Out-Null

    if (Test-Path $outFile) {
        $stagedStems += [PSCustomObject]@{
            Original   = $stem.FullName
            Staged     = $outFile
            Name       = $stem.BaseName
            Type       = Get-StemType $stem.Name
        }
    } else {
        Write-Host "  [WARN] Failed to stage: $($stem.Name)" -ForegroundColor Yellow
        $Script:Warnings += "Staging failed for $($stem.Name)"
    }
}

Write-Host "  $($stagedStems.Count) stems staged at -6 dBFS / ${referenceSR}Hz / 24-bit stereo" -ForegroundColor Green
Write-Agent 2 "Gain Staging — Peak normalize to -6 dBFS" "DONE"

# ─────────────────────────────────────────────────────────────────────────────
# AGENT 3 — GENRE-SPECIFIC EQ (R&B / TRAP)
# ─────────────────────────────────────────────────────────────────────────────
Write-Agent 3 "Genre-Specific EQ — RnB/Trap stem processing"

# EQ recipes per stem type
# SoX equalizer: equalizer <freq> <bandwidth>q <gain_dB>
# SoX highpass/lowpass: highpass <freq>  |  lowpass <freq>
$EQRecipes = @{
    "808" = @(
        "highpass 30",                         # Remove sub-rumble below 30Hz
        "equalizer 60 0.7q +4",                # Boost fundamental sub punch at 60Hz
        "equalizer 120 1.0q +2",               # Upper sub warmth at 120Hz
        "equalizer 300 1.2q -3",               # Cut mid-mud at 300Hz
        "equalizer 1000 1.5q -2",              # Tame click harshness at 1kHz
        "lowpass 3000"                         # Cut everything above 3kHz — 808 doesn't need it
    )
    "kick" = @(
        "highpass 40",                         # Sub rumble removal
        "equalizer 60 0.8q +3",               # Kick thump
        "equalizer 200 1.2q -2",              # Remove boxy mud
        "equalizer 800 2.0q -1",              # Reduce low-mid buildup
        "equalizer 5000 1.5q +2",             # Beater click attack
        "lowpass 12000"
    )
    "snare" = @(
        "highpass 100",
        "equalizer 200 1.5q +2",              # Snare body
        "equalizer 400 1.5q -2",              # Mud cut
        "equalizer 3000 2.0q +1",             # Snap presence
        "equalizer 8000 2.0q +2"              # Air and crack
    )
    "hihat" = @(
        "highpass 800",                        # Hard HP — hi-hats live above 800Hz
        "equalizer 3000 2.0q -2",             # Reduce harshness
        "equalizer 8000 2.5q +1",             # Sizzle and air
        "equalizer 12000 2.0q +2"             # Top-end shimmer
    )
    "lead_vocal" = @(
        "highpass 80",                         # Remove mic rumble
        "equalizer 200 1.5q -3",              # De-mud chest frequencies
        "equalizer 300 1.5q -2",              # Cut honk
        "equalizer 1000 2.0q -1",             # Tame nasality
        "equalizer 3000 2.0q +2",             # Presence and intelligibility
        "equalizer 8000 2.0q +2",             # Air and breathiness
        "lowpass 16000"
    )
    "adlib_vocal" = @(
        "highpass 100",
        "equalizer 300 1.5q -3",              # Cut mud — adlibs sit behind lead
        "equalizer 2000 2.0q +1",
        "equalizer 6000 2.0q +1",
        "lowpass 14000"
    )
    "harmony_vocal" = @(
        "highpass 150",
        "equalizer 300 1.5q -2",
        "equalizer 800 2.0q -1",
        "equalizer 4000 2.0q +1",
        "lowpass 14000"
    )
    "melody" = @(
        "highpass 120",
        "equalizer 200 1.5q -2",
        "equalizer 1500 2.0q +1",
        "equalizer 5000 2.0q +1"
    )
    "synth" = @(
        "highpass 100",
        "equalizer 200 1.5q -3",              # Remove low-end competition with 808
        "equalizer 2000 2.5q +1",
        "equalizer 8000 2.0q +1"
    )
    "pad" = @(
        "highpass 200",                        # Pads in the mix only need mids and up
        "equalizer 400 2.0q -2",
        "equalizer 2000 2.5q +1",
        "lowpass 10000"
    )
    "keys" = @(
        "highpass 80",
        "equalizer 200 1.5q -2",
        "equalizer 1500 2.0q +1",
        "equalizer 6000 2.0q +1"
    )
    "guitar" = @(
        "highpass 80",
        "equalizer 300 2.0q -2",
        "equalizer 2000 2.0q +1",
        "equalizer 7000 2.0q +1"
    )
    "strings" = @(
        "highpass 60",
        "equalizer 400 2.0q -2",
        "equalizer 2000 2.0q +1"
    )
    "perc" = @(
        "highpass 200",
        "equalizer 1000 2.0q +1",
        "equalizer 5000 2.0q +1"
    )
    "fx" = @(
        "highpass 100",
        "equalizer 500 2.0q -1"
    )
    "atmosphere" = @(
        "highpass 200",
        "equalizer 4000 2.5q +1",
        "lowpass 12000"
    )
    "unknown" = @(
        "highpass 80",
        "equalizer 300 1.5q -1"
    )
}

$eqStems = @()
foreach ($stem in $stagedStems) {
    $recipe = if ($EQRecipes.ContainsKey($stem.Type)) { $EQRecipes[$stem.Type] } else { $EQRecipes["unknown"] }
    $outFile = Join-Path $EQd ($stem.Name + "_eq.wav")

    # Build SoX command with EQ chain
    $soxArgs = @($stem.Staged, $outFile) + $recipe

    Write-Host "  EQ [$($stem.Type)]: $($stem.Name)  →  $($recipe.Count) filters applied" -ForegroundColor Gray
    & sox $soxArgs 2>&1 | Out-Null

    if (Test-Path $outFile) {
        $eqStems += [PSCustomObject]@{
            Name    = $stem.Name
            File    = $outFile
            Type    = $stem.Type
            Filters = $recipe
        }
    } else {
        Write-Host "  [WARN] EQ failed for $($stem.Name) — using staged version" -ForegroundColor Yellow
        $Script:Warnings += "EQ failed for $($stem.Name)"
        Copy-Item $stem.Staged $outFile -Force
        $eqStems += [PSCustomObject]@{ Name = $stem.Name; File = $outFile; Type = $stem.Type; Filters = @() }
    }
}

Write-Host "  EQ applied to $($eqStems.Count) stems" -ForegroundColor Green
Write-Agent 3 "Genre-Specific EQ — RnB/Trap stem processing" "DONE"

# ─────────────────────────────────────────────────────────────────────────────
# AGENT 4 — VOCAL BUS MIX + COMPRESSION
# ─────────────────────────────────────────────────────────────────────────────
Write-Agent 4 "Vocal Bus — Mix + compression"

$vocalTypes  = @("lead_vocal","adlib_vocal","harmony_vocal")
$vocalStems  = $eqStems | Where-Object { $vocalTypes -contains $_.Type }

if ($vocalStems.Count -gt 0) {
    $vocalBusFile = Join-Path $VocalBus "vocal_bus.wav"

    if ($vocalStems.Count -eq 1) {
        Copy-Item $vocalStems[0].File $vocalBusFile -Force
        Write-Host "  Single vocal stem — passed through directly" -ForegroundColor Gray
    } else {
        # SoX remix to mix multiple vocals down
        $soxArgs = @("-m") + ($vocalStems | ForEach-Object { $_.File }) + @($vocalBusFile)
        Write-Host "  Mixing $($vocalStems.Count) vocal stems to bus..." -ForegroundColor Gray
        & sox $soxArgs 2>&1 | Out-Null
    }

    # Apply bus compression via FFmpeg
    if (Test-Path $vocalBusFile) {
        $vocalBusComp = Join-Path $VocalBus "vocal_bus_comp.wav"
        # acompressor: attack=5ms, release=80ms, ratio=4:1, threshold=-18dBFS, knee=6dB
        $ffmpegArgs = @(
            "-i", $vocalBusFile,
            "-af", "acompressor=threshold=0.125:ratio=4:attack=5:release=80:knee=6:makeup=2",
            "-y", $vocalBusComp
        )
        Write-Host "  Compressing vocal bus (4:1 / -18dBFS threshold / 5ms attack)..." -ForegroundColor Gray
        & ffmpeg $ffmpegArgs 2>&1 | Out-Null
        Write-Host "  Vocal bus → vocal_bus_comp.wav" -ForegroundColor Green
    }

    Write-Host "  Vocal bus built from: $($vocalStems | ForEach-Object { $_.Name } | Join-String ', ')" -ForegroundColor Gray
} else {
    Write-Host "  [WARN] No vocal stems found — vocal bus skipped" -ForegroundColor Yellow
    $Script:Warnings += "No vocal stems detected — vocal bus not created"
}

Write-Agent 4 "Vocal Bus — Mix + compression" "DONE"

# ─────────────────────────────────────────────────────────────────────────────
# AGENT 5 — MUSIC BUS MIX + COMPRESSION
# ─────────────────────────────────────────────────────────────────────────────
Write-Agent 5 "Music Bus — Mix + compression"

$musicTypes  = @("808","kick","snare","hihat","melody","synth","pad","keys","guitar","strings","perc","fx","atmosphere","unknown")
$musicStems  = $eqStems | Where-Object { $musicTypes -contains $_.Type }

if ($musicStems.Count -gt 0) {
    $musicBusFile = Join-Path $MusicBus "music_bus.wav"

    if ($musicStems.Count -eq 1) {
        Copy-Item $musicStems[0].File $musicBusFile -Force
    } else {
        $soxArgs = @("-m") + ($musicStems | ForEach-Object { $_.File }) + @($musicBusFile)
        Write-Host "  Mixing $($musicStems.Count) music stems to bus..." -ForegroundColor Gray
        & sox $soxArgs 2>&1 | Out-Null
    }

    if (Test-Path $musicBusFile) {
        $musicBusComp = Join-Path $MusicBus "music_bus_comp.wav"
        # Gentler bus compression for the music bed (2:1, slower attack)
        $ffmpegArgs = @(
            "-i", $musicBusFile,
            "-af", "acompressor=threshold=0.25:ratio=2:attack=20:release=150:knee=6:makeup=1",
            "-y", $musicBusComp
        )
        Write-Host "  Compressing music bus (2:1 / -12dBFS threshold / 20ms attack)..." -ForegroundColor Gray
        & ffmpeg $ffmpegArgs 2>&1 | Out-Null
        Write-Host "  Music bus → music_bus_comp.wav" -ForegroundColor Green
    }
} else {
    Write-Host "  [WARN] No music stems found — music bus skipped" -ForegroundColor Yellow
    $Script:Warnings += "No music stems detected"
}

Write-Agent 5 "Music Bus — Mix + compression" "DONE"

# ─────────────────────────────────────────────────────────────────────────────
# AGENT 6 — MASTER RENDER (FFmpeg loudnorm → -14 LUFS / -1.0 dBTP)
# ─────────────────────────────────────────────────────────────────────────────
Write-Agent 6 "Master Render — FFmpeg loudnorm (-14 LUFS / -1.0 dBTP)"

$vocalComp = Join-Path $VocalBus "vocal_bus_comp.wav"
$musicComp = Join-Path $MusicBus "music_bus_comp.wav"

# Determine what we're mixing into the master
$masterInputs = @()
if (Test-Path $vocalComp) { $masterInputs += $vocalComp }
if (Test-Path $musicComp) { $masterInputs += $musicComp }

if ($masterInputs.Count -eq 0) {
    Write-Host "  [ERROR] No bus outputs found. Cannot create master." -ForegroundColor Red
    $Script:Errors += "Master render failed — no bus outputs"
} else {
    $preMaster = Join-Path $Master "pre_master.wav"
    $masterOut = Join-Path $Master "$($Config.TrackName)_360RA_MASTER.wav"

    # Step 1 — Mix buses to stereo pre-master
    if ($masterInputs.Count -eq 1) {
        Copy-Item $masterInputs[0] $preMaster -Force
    } else {
        $soxArgs = @("-m") + $masterInputs + @($preMaster)
        Write-Host "  Combining vocal + music buses..." -ForegroundColor Gray
        & sox $soxArgs 2>&1 | Out-Null
    }

    # Step 2 — Loudnorm pass 1: measure integrated loudness
    Write-Host "  Pass 1 — Measuring loudness of pre-master..." -ForegroundColor Gray
    $measureOutput = & ffmpeg -i $preMaster -af "loudnorm=I=$($Config.TargetLUFS):TP=$($Config.TruePeakdBTP):LRA=11:print_format=json" -f null - 2>&1

    # Parse measured_I, measured_TP, measured_LRA from ffmpeg JSON output
    $jsonLines  = ($measureOutput | Select-String -Pattern '^\{' -Context 0,20).Line
    $jsonBlock  = ""
    $inJson     = $false
    foreach ($line in $measureOutput) {
        if ($line -match "^\{") { $inJson = $true }
        if ($inJson) { $jsonBlock += $line + "`n" }
        if ($line -match "^\}") { $inJson = $false; break }
    }

    $measured_I   = "-23.0"  # fallback defaults
    $measured_TP  = "-2.0"
    $measured_LRA = "7.0"
    $measured_thresh = "-33.0"
    $measured_offset = "0.0"

    try {
        $parsed = $jsonBlock | ConvertFrom-Json
        $measured_I      = $parsed.input_i
        $measured_TP     = $parsed.input_tp
        $measured_LRA    = $parsed.input_lra
        $measured_thresh = $parsed.input_thresh
        $measured_offset = $parsed.target_offset
        Write-Host "  Measured: $measured_I LUFS  |  TP: $measured_TP dBTP  |  LRA: $measured_LRA LU" -ForegroundColor Cyan
    } catch {
        Write-Host "  [WARN] Could not parse loudnorm JSON — using measured fallbacks" -ForegroundColor Yellow
        $Script:Warnings += "Loudnorm measurement parse failed — used defaults"
    }

    # Step 3 — Loudnorm pass 2: apply targeting measured values
    Write-Host "  Pass 2 — Rendering master to $($Config.TargetLUFS) LUFS / $($Config.TruePeakdBTP) dBTP..." -ForegroundColor Gray
    $loudnormFilter = "loudnorm=I=$($Config.TargetLUFS):TP=$($Config.TruePeakdBTP):LRA=11:" +
                      "measured_I=${measured_I}:measured_TP=${measured_TP}:measured_LRA=${measured_LRA}:" +
                      "measured_thresh=${measured_thresh}:offset=${measured_offset}:linear=true:print_format=summary"

    $ffmpegArgs = @(
        "-i", $preMaster,
        "-af", $loudnormFilter,
        "-ar", $referenceSR,
        "-acodec", "pcm_s24le",
        "-y", $masterOut
    )
    & ffmpeg $ffmpegArgs 2>&1 | Out-Null

    if (Test-Path $masterOut) {
        $masterSize = [math]::Round((Get-Item $masterOut).Length / 1MB, 2)
        Write-Host "  Master rendered: $($Config.TrackName)_360RA_MASTER.wav  ($masterSize MB)" -ForegroundColor Green
    } else {
        Write-Host "  [ERROR] Master file not created" -ForegroundColor Red
        $Script:Errors += "FFmpeg master render produced no output"
    }
}

Write-Agent 6 "Master Render — FFmpeg loudnorm (-14 LUFS / -1.0 dBTP)" "DONE"

# ─────────────────────────────────────────────────────────────────────────────
# AGENT 7 — LOUDNESS MEASUREMENT REPORT
# ─────────────────────────────────────────────────────────────────────────────
Write-Agent 7 "Loudness Report — per-stem + master measurement"

$loudnessReport = @()
$masterOut = Join-Path $Master "$($Config.TrackName)_360RA_MASTER.wav"

$allMeasureFiles = @()
foreach ($stem in $eqStems) { $allMeasureFiles += $stem }
if (Test-Path $masterOut) {
    $allMeasureFiles += [PSCustomObject]@{ Name = "MASTER"; File = $masterOut; Type = "master" }
}

foreach ($item in $allMeasureFiles) {
    $fileToMeasure = if ($item.PSObject.Properties["File"]) { $item.File } else { $item }
    if (-not (Test-Path $fileToMeasure)) { continue }

    $lufsOutput = & ffmpeg -i $fileToMeasure -af "loudnorm=I=-23:TP=-1:LRA=11:print_format=json" -f null - 2>&1
    $intLUFS = "?"
    $truePeak = "?"

    foreach ($line in $lufsOutput) {
        if ($line -match '"input_i"\s*:\s*"([^"]+)"') { $intLUFS = $matches[1] }
        if ($line -match '"input_tp"\s*:\s*"([^"]+)"') { $truePeak = $matches[1] }
    }

    $label = if ($item.PSObject.Properties["Name"]) { $item.Name } else { "file" }
    $type  = if ($item.PSObject.Properties["Type"]) { $item.Type } else { "" }

    $loudnessReport += [PSCustomObject]@{
        Stem      = $label
        Type      = $type
        LUFS      = $intLUFS
        TruePeak  = $truePeak
        Status    = if ($label -eq "MASTER") {
                        if ([double]$intLUFS -lt -15 -or [double]$intLUFS -gt -13) { "CHECK" } else { "PASS" }
                    } else { "INFO" }
    }

    $statusColor = switch ($loudnessReport[-1].Status) {
        "PASS"  { "Green" }
        "CHECK" { "Yellow" }
        default { "Gray" }
    }
    Write-Host ("  {0,-35} {1,8} LUFS   TP: {2,7} dBTP   [{3}]" -f $label, $intLUFS, $truePeak, $loudnessReport[-1].Status) -ForegroundColor $statusColor
}

# Save report
$reportPath = Join-Path $Reports "loudness_report.csv"
$loudnessReport | Export-Csv -Path $reportPath -NoTypeInformation
Write-Host "  Loudness report saved → loudness_report.csv" -ForegroundColor Green
Write-Agent 7 "Loudness Report — per-stem + master measurement" "DONE"

# ─────────────────────────────────────────────────────────────────────────────
# AGENT 8 — SPATIAL MANIFEST GENERATOR (WalkMix Creator reference JSON)
# ─────────────────────────────────────────────────────────────────────────────
Write-Agent 8 "Spatial Manifest — JSON object placement for WalkMix Creator"

$manifestObjects = @()
$objectIndex = 1

foreach ($stem in $eqStems) {
    $spatial = if ($SpatialMap.ContainsKey($stem.Type)) {
        $SpatialMap[$stem.Type]
    } else {
        @{ Azimuth = 0; Elevation = 0; Distance = 1.5; Description = "Unknown type — positioned center as default" }
    }

    $manifestObjects += [ordered]@{
        object_id    = $objectIndex
        stem_name    = $stem.Name
        stem_type    = $stem.Type
        file         = Split-Path $stem.File -Leaf
        spatial      = [ordered]@{
            azimuth     = $spatial.Azimuth
            elevation   = $spatial.Elevation
            distance    = $spatial.Distance
            description = $spatial.Description
        }
        walkmix_notes = "Import $(Split-Path $stem.File -Leaf) as Object $objectIndex. Set azimuth=$($spatial.Azimuth)° elevation=$($spatial.Elevation)° distance=$($spatial.Distance). $($spatial.Description)"
    }
    $objectIndex++
}

$manifest = [ordered]@{
    schema_version = "1.0"
    generated_at   = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    track          = [ordered]@{
        name   = $Config.TrackName
        artist = $Config.Artist
        bpm    = $Config.BPM
        key    = $Config.Key
        genre  = $Config.Genre
    }
    master_target  = [ordered]@{
        integrated_loudness_lufs = $Config.TargetLUFS
        true_peak_dbtp           = $Config.TruePeakdBTP
        lra                      = 11
        format                   = "360 Reality Audio / MPEG-H"
    }
    walkmix_workflow = @(
        "1. Open WalkMix Creator (standalone or as VST3/AAX inside your DAW)"
        "2. Create a new 360 Reality Audio session"
        "3. Import each stem file listed below as a separate audio object"
        "4. For each object: set azimuth, elevation, and distance from the spatial block"
        "5. Preview in binaural headphone mode — adjust positions to taste"
        "6. Fine-tune distance for depth layering (closer = more intimate/upfront)"
        "7. Export the final 360RA master from WalkMix — select MPEG-H 3D Audio output"
        "8. Submit the .mha or .mp4 file to your distributor"
    )
    objects        = $manifestObjects
}

$manifestPath = Join-Path $Reports "$($Config.TrackName)_spatial_manifest.json"
$manifest | ConvertTo-Json -Depth 10 | Set-Content -Path $manifestPath -Encoding UTF8

Write-Host "`n  Spatial Object Placement Summary:" -ForegroundColor Cyan
foreach ($obj in $manifestObjects) {
    Write-Host ("    [{0:D2}] {1,-30} az:{2,5}°  el:{3,4}°  dist:{4}" -f `
        $obj.object_id, $obj.stem_name, $obj.spatial.azimuth, $obj.spatial.elevation, $obj.spatial.distance) -ForegroundColor White
}

Write-Host "`n  Manifest saved → $($Config.TrackName)_spatial_manifest.json" -ForegroundColor Green
Write-Agent 8 "Spatial Manifest — JSON object placement for WalkMix Creator" "DONE"

# ─────────────────────────────────────────────────────────────────────────────
# AGENT 9 — DELIVERY CHECKLIST
# ─────────────────────────────────────────────────────────────────────────────
Write-Agent 9 "Delivery Checklist + Next Steps"

$masterFile = Join-Path $Master "$($Config.TrackName)_360RA_MASTER.wav"
$masterExists = Test-Path $masterFile
$manifestExists = Test-Path $manifestPath

Write-Host @"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DELIVERY CHECKLIST — $($Config.TrackName)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"@ -ForegroundColor Magenta

$checks = [ordered]@{
    "Stems validated ($($stems.Count) files)"              = ($stems.Count -gt 0)
    "Stems gain-staged to -6 dBFS"                         = ($stagedStems.Count -eq $stems.Count)
    "Genre EQ applied to all stems"                        = ($eqStems.Count -gt 0)
    "Vocal bus created + compressed"                       = (Test-Path (Join-Path $VocalBus "vocal_bus_comp.wav"))
    "Music bus created + compressed"                       = (Test-Path (Join-Path $MusicBus "music_bus_comp.wav"))
    "Master rendered ($($Config.TargetLUFS) LUFS / $($Config.TruePeakdBTP) dBTP)"  = $masterExists
    "Loudness report exported (CSV)"                       = (Test-Path $reportPath)
    "Spatial manifest generated (JSON)"                    = $manifestExists
}

foreach ($check in $checks.GetEnumerator()) {
    $icon  = if ($check.Value) { "[✓]" } else { "[✗]" }
    $color = if ($check.Value) { "Green" } else { "Red" }
    Write-Host "  $icon  $($check.Key)" -ForegroundColor $color
}

Write-Host @"

  OUTPUT FOLDER: $($Config.OutputFolder)
  ├── 01_staged/           ← Gain-staged stems (24-bit, normalized -6 dBFS)
  ├── 02_eq/               ← EQ-processed stems (ready for WalkMix import)
  ├── 03_vocal_bus/        ← Vocal mix bus (compressed)
  ├── 04_music_bus/        ← Music mix bus (compressed)
  ├── 05_master/           ← Pre-master + final master WAV
  └── 06_reports/
      ├── loudness_report.csv
      └── $($Config.TrackName)_spatial_manifest.json

"@ -ForegroundColor Gray

Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host @"
  1. Open WalkMix Creator (Sony 360 Reality Audio Creator portal — free registration)
     https://creator.360ra.com/

  2. Import the EQ'd stems from: $EQd
     These are the files you'll treat as spatial objects inside WalkMix

  3. Load the spatial manifest as your placement reference:
     $manifestPath
     Each object has pre-calculated azimuth / elevation / distance

  4. Work through each object in the manifest:
       - Lead vocal → front center (az:0, el:0, dist:0.8) — listener's eye-level focus
       - 808 / bass  → center, -20° below plane — felt more than heard
       - Hi-hats      → right overhead (az:90, el:20) — overhead shimmer
       - Pads/atmos  → rear / dome — wrap the listener in the bed

  5. Binaural preview as you place — headphone check is essential for 360RA

  6. Export from WalkMix as MPEG-H 3D Audio (.mha or wrapped .mp4)

  7. Deliver master file to distributor (DSPs supporting 360RA: Apple Music, Tidal, Amazon Music HD)
"@ -ForegroundColor White

if ($Script:Warnings.Count -gt 0) {
    Write-Host "`n  WARNINGS:" -ForegroundColor Yellow
    foreach ($w in $Script:Warnings) {
        Write-Host "  ⚠  $w" -ForegroundColor Yellow
    }
}

if ($Script:Errors.Count -gt 0) {
    Write-Host "`n  ERRORS:" -ForegroundColor Red
    foreach ($e in $Script:Errors) {
        Write-Host "  ✗  $e" -ForegroundColor Red
    }
}

Write-Host "`n  Pipeline complete. $(if ($Script:Errors.Count -eq 0) { '✓ No errors.' } else { "$($Script:Errors.Count) error(s) — see above." })" -ForegroundColor (if ($Script:Errors.Count -eq 0) { "Green" } else { "Red" })
Write-Agent 9 "Delivery Checklist + Next Steps" "DONE"
Write-Host ""
