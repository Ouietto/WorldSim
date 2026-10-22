# Consolidation investigation — baseline and v0.12 corrections

This investigation observes v0.10 at commit `ec00351`, with default parameters
and Earth history seed 7, from 9001 BCE through 2700 BCE. It was started from a
clean checkout before the v0.11 development changes. It does not reproduce an
unknown user's seed, establish a historical target empire size, or represent an
ensemble. Province count is a coarse spatial measure, not a city count or a
fixed land area at every latitude.

Raw observations: `validation/consolidation-v10-seed7.jsonl`. Reproduce with:

```
node src/consolidation-report.js 7 -2700 ec00351
```

The diagnostic wraps existing functions to count results. It does not change
parameters or consume extra random draws. An optional Git reference reads the
actual old source and numerical assets without changing the checkout.

## Observations

At 2700 BCE there are 111 live settled polities, averaging 1.70 provinces. The
largest has 11 provinces and about 991,000 residents. Mean institutional health
is 97.2%, payroll fulfillment 99.4%, and food shortage zero at that checkpoint.
The largest polity has substantial reserves, almost complete bureaucratic skill
and high institutional health. Technology availability alone has not resolved
the geographical fragmentation.

Across the whole history:

| Observation | Count |
|---|---:|
| Territorial attack calls against a polity | 10,152 |
| Territorial attack calls into autonomous/empty land | 3,888 |
| Attack calls ending with ownership of the targeted province | 65 |
| State campaign allocations returning a positive effective force | 3,229 |
| Calls reaching the siege check after a successful field battle | 70 |
| Rural protection agreements / rural incorporations | 0 / 0 |
| Negotiated civic unions | 5 |
| Civil-war calls for settled polities | 11, all under 20 provinces |

These are cumulative function outcomes, not 14,040 separate wars. Annexations
of other provinces after a decisive result and peaceful unions are separate
from the targeted-province capture count. Campaign allocation also serves the
existing military machinery. The late checkpoint is not representative of
every state's finances in every earlier century.

## 1. Occupation capacity blocks the first expansion

`refreshForces()` subtracts existing administration, a fixed cost per province,
border commitments and conquest burdens from personnel. Early staff training
often leaves this result at zero. `frontierHoldable()` then requires spare
occupation capacity even when the target is another settled government.
`frontierReady()` adds population and transport requirements for autonomous
territory. Small healthy governments can therefore need the revenue, people
and officials of a larger realm before they can obtain one.

At 5500 BCE, all 1,738 observed settled-state holdability checks so far had
failed. Later technology relaxes the bottleneck, but does not address its
political structure.

Proposed change: distinguish the capacity to campaign, obtain submission, and
directly administer conquered land. A defeated settled neighbor can retain
councils, officials and tax collectors under negotiated obligations. Direct
incorporation needs additional staff, protection and integration over time.
New colonies and exposed pastoral frontiers retain much higher supply and
security demands. Delegation brings revenue and contingents but also autonomy,
elite bargaining and opportunities to defect.

## 2. Offensive mobilization is too fragmented relative to local defense

`campaignForce()` starts from the integrated recruitment base, divides troops
between offense and defense, and further divides offense among neighboring
polities. Distance reduces effective strength again. Small states can fall
below the minimum 100 allocated troops. Meanwhile defenders combine a local
population levy, reserves, terrain, preparedness and fortifications. For much
of the run very few allocated campaigns reach a field victory.

Proposed change: maintain a specific campaign objective and concentrate a
finite, provisioned army there. Permit paid seasonal musters and negotiated
allied/subject contingents while reducing their farming labor and guarding
capacity at home. Local defenders also need mobilization time, provisions and
cooperation. Avoid a flat attack bonus or removal of terrain and nomad defense.

## 3. Early political bargains have no reliable bridge to consolidation

Rights drift toward a technology-dependent target. Before charters diffuse,
founders' customary rights erode. Rural protection and incorporation require
high security, rights, sustained influence and officials; civic union requires
still stronger rights and reliability. The conditions can be individually
reasonable while their timing and combined thresholds make the early path
effectively inaccessible. No rural protection agreement occurs in this run.

Proposed change: track customary obligations and reliable delivery of services
before written charters. Written law can make agreements more portable and
durable rather than being their effective prerequisite. Evaluate protection
over actual farming catchments and maintained local routes; let tribute and
shared defense precede direct ownership. Calibrate the combined thresholds
against scenarios where funded nearby farms accept protection and unsupported
or hostile communities refuse it.

## 4. Sieges lack reliable campaign continuity

This is a source-level constraint whose effect is small in the observed run:
only five siege checks fail before 2700 BCE. A siege advances only after another
successful probabilistic border attack, yet progress decays after a gap in
annual support. Stronger late cities can consequently require repeated lucky
field victories merely to keep an existing blockade active.

Proposed change: an established siege becomes an ongoing supplied campaign with
a committed contingent. It advances or fails annually according to provisions,
engineering, relief forces, disease and defenders' stocks. Withdrawal releases
the troops and lets defenses recover. It does not grant instant capture.

## Proposed implementation order and validation

Implement the first three mechanisms together, then siege continuity. Preserve
communication limits, costly occupation, frontier resistance, rapid-conquest
obligations and succession risks. There is no evidence here for simply reducing
all collapse risk or increasing every state's aggression.

Test finite troops, food and administrators in focused scenarios. Compare
several fixed histories for regional concentration, lifetime and size of
polities, negotiated dependencies, civil wars, fiscal failures, and penetration
of exposed pastoral land. Check intermediate checkpoints as well as an end
date. Increased consolidation should arise under favorable material and
institutional conditions, not a compulsory date or a guaranteed world empire.

The first three corrections are implemented in v0.12 following approval. The
separate persistent-siege proposal remains deferred. Military household
settlements and local town foundations were also authorized and implemented;
[MODEL.md](MODEL.md) documents their costs and limits. The old-source baseline
remains available for comparison. Validation of individual mechanisms does not
establish historical dates or the distribution of successful empires.
