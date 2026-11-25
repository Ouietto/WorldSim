# Corruption and intelligence: agreed plan (Nein, 2026-11-24)

Status: **phase 1 built** (f2ba92a1, opt-in switch `corrupt`, run 143; see docs/handoff.md). Phases 2 and 3 not built.
Everything emerges from what the model already tracks; no new stocks.

## Corruption: one realm-wide level, derived each year
- Read from existing conditions:
  - **up:** surplus elite (E above what offices carry), officials unpaid (burden above 1, treasury below 0), distance and loose
    integration, lords' share, a slack court (vigilance), the ruler's greed, weak legitimacy;
  - **down:** oversight from records, ledgers, law codes and roads/relays (inspectors), a vigilant capable ruler, outside threat.
- **Memory** comes from the slow parts: the elite swells over generations, vigilance fades in long peace. So corruption builds
  over a dynasty's life and falls when a crisis or a new house resets them.
- **Provincial gradient:** higher far from the court, where lords hold land, and where integration is loose.
- **Feedback loop:** what corruption takes feeds the elite, and a larger elite breeds more corruption.

## Channels
| Channel | Effect |
|---|---|
| Taxes | collectors skim: peasants pay in full, the court receives less |
| Levy | padded rolls and sold exemptions: fewer men raised |
| Army pay and supply | soldiers unpaid even when the treasury pays (feeds the pay rules) |
| Offices | posts sold and multiplied: replaces the bloated-court rule (noovh) |
| Governors and justice | provinces bound less tightly: more defection to protectors and secession |
| Gates and commands | more treachery, gates opened, generals holding back |
| Secrets (phase 2) | leaks to rivals; false reports believed on near a coin toss without records or experience |
| Customs (phase 3, with trade ties) | trade revenue leaks |

**Technology moves corruption around.** Writing and censuses cut tax and levy fraud; coinage makes skimming and bribery easier;
ledgers cut pay fraud; more offices mean more to sell; roads let inspectors reach the provinces; trade opens customs fraud.

## Intelligence: derived, not a stock (phase 2)
- **Capacity** from administrative complexity, records and messenger speed.
- **Scaled down** when the court cannot pay its way, and by corruption.
- **Low capacity:** crude, temperament-driven judgment (sees only size and people; a bold king overrates his chances, a cautious
  one waits).
- **High capacity:** sees an enemy's failing (unpaid troops, crumbling walls, a court in crisis), strikes the weak points (which
  province to attack), and learns from its wars (lessons kept as far as records allow).
- Replaces the run-142 fog (`nojudge`), which cost error.

## Reform can arise in several ways
- **Quietly and locally:** a practice of checks (town councils auditing collectors, merchant courts policing their own) appears
  where towns, trade and records give people a stake. It spreads like other know-how along roads, trade and within realms,
  lowering corruption where held, and realm-wide once the court holds it.
- **From the top:** a capable, vigilant ruler facing high corruption moves against it. Fast, but it strikes at the elite's income
  and risks backlash (coup, revolt, lords seceding), as with Urukagina of Lagash (c. 2350 BCE).
- **Through crisis or a new house:** the existing release rule clears corrupt office-holders.

## Left out for now
Temples and religious figures. A possible non-cynical route later: temple estates as landholders whose stewards can skim like
any officials. That would be corruption of administration, not of belief.

## Build order
1. Corruption core, reform, and the taxes, levy, army pay, offices, governors and gates channels. **Done (run 143).**
2. Intelligence (derived) and the secrets channel; replace the fog.
3. Customs and subversion with trade ties.

Each channel gets its own off switch and its strengths are knobs.
