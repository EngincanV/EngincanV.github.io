---
title: 'Home Server - Part 1 - Specs and Proxmox Install'
date: 2022-07-05 15:01:01 +/-0000
categories: [HomeServer, Hardware]
tags: [hardware, server, homelab, ryzen, pfsense, proxmox]
---

## Specs

```
Ryzen 2600X
48GB DDR4 2666MHz
120GB Boot SSD
512GB VM Storage SSD
Geforce GT240 (for installation)
Two Gigabit Ethernet Adapters
```
Assumes home server taking role of router for the network skip pfsense setup and choose ip for proxmox in current lan range if using existing router.

## Proxmox Setup
```
Download Proxmox 7 ISO - Burn to DVD or USB
Install Proxmox 7
Use IP 192.168.1.2
Use 120GB SSD
```
```
Open WebUI (https://192.168.1.2:8006)
Login with root and password set during install
click node under datacenter, system section, network then create bridge
Leave all blank except bridge ports (enter name of second ethernet card, inactive card behind window)
```