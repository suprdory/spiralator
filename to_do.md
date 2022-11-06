# to do

* handle oversize non-inverted arcs

# done
* preview!
* force roll (and auto) to pass through roll discontinuities - move checks for transition between pivot points and forces a point at roll centre 
* fix inverted nudgeing
* move updateShape() function to pair as it now requires pair info
* allow 'hanging' for ArcRad > fix Rad - new geom required - decided to just pivot instead
* prevent m.arcTeeth > m.teeth, scale m.teeth with m.arcTeeth? - does not occur with new arness def
* fix tha_pp thg_pp for arc size > fized size - all pivoting beviour mode sorted
* fix glitch at th=0 for m.teeth >f.teeth - addded small offset at 0
* allow arcRad inversion - new geom required - sorted.
* rearrange, rename sliders. add saturation.
* maintain arcness while changing moving teeth
* check scruffy arc rendering - fixed with module 2PI in draw theta
* moving teeth slider should call pair.move(pair.th)
* make pen rad independent ar arc rad, teeth only?
* change pen angle to +/- pi
* display arcness when slider depressed 
* increase arcness slide rate
* fix auto rate, proportional to teeth ratio?
* fix narcs=1
* check nArc=1 nudging, compare to standard fixed disc behaviour