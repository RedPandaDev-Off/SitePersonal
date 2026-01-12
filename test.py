def degats_apoth(dmg, armor=29, tough=23.46, prot_pts=5,
                 armor_pierce=12, tough_pierce=10, shred=15, prot_pierce=10):
    tough_eff = max(0, tough - tough_pierce)
    mit = min(1.0, tough_eff * 0.005)  # 0.5%/pt
    pierce_eff = armor_pierce * (1 - mit)
    shred_eff = (shred / 100) * (1 - mit)
    armor_eff = max(0, armor * (1 - shred_eff) - pierce_eff)
    post_armor = dmg * (50 / (50 + armor_eff))
    prot_eff = max(0, prot_pts - prot_pierce)
    prot_dr = min(0.85, prot_eff * 0.025)
    return round(post_armor * (1 - prot_dr), 2)

print(degats_apoth(50))  # 39.22 → DÉMONTER !