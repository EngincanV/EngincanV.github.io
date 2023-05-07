---
layout: post
title:  "What is the hosts file and how to block websites by using it?"
date:   2022-12-17 00:00:00 +0300
categories: hosts tcp/ip dns
image: "/assets/images/hosts-article/github-connection-refused.png"
---

In this article, we are going to cover what is the hosts file and why we might want to use it. Also, I will mention how to block a website by configuring this file. 

Let's start with defining what the hosts file is.

## What is the hosts file?

Wikipedia defines the [hosts](https://en.wikipedia.org/wiki/Hosts_(file)) file as:

> The computer file hosts is an operating system file that maps hostnames to IP addresses. 

The hosts files were used to resolve host names for a long time before the [DNS](https://en.wikipedia.org/wiki/Domain_Name_System) was implemented. Since they were used to aid in network name resolution, hosts file grew to become a massive document. After the DNS is implemented, without configuring the mapping for IP addresses to hostnames in the hosts file, thanks to the DNS system now we are accessing pages through domain addresses dynamically.

However, the hosts files used for decades before DNS system and still operating systems such as Windows, Mac and Linux have this file, in the following directories:

* Windows -> `%SystemRoot%\System32\drivers\etc\hosts`
* MAC & Linux -> `/etc/hosts`

You can see a sample hosts file content down below:

```
# Copyright (c) 1993-2009 Microsoft Corp.
#
# This is a sample HOSTS file used by Microsoft TCP/IP for Windows.
#
# This file contains the mappings of IP addresses to host names. Each
# entry should be kept on an individual line. The IP address should
# be placed in the first column followed by the corresponding host name.
# The IP address and the host name should be separated by at least one
# space.
#
# Additionally, comments (such as these) may be inserted on individual
# lines or following the machine name denoted by a '#' symbol.
#
# For example:
#
#      113.84.44.97     rhino.acme.com          # source server
#       38.25.63.10     x.acme.com              # x client host
# localhost name resolution is handled within DNS itself.
#	127.0.0.1       localhost
#	::1             localhost
# End of section
```

The hosts file contains lines of text consisting of IP addresses in the first text field followed by one or more host names. The host names map to the IPs, not vice versa.

The hosts file still uses before DNS came into play. When looking up an IP address, the computer first looks at the **hosts** file to resolve the hostname. If the hostname is not in the **hosts** file, the DNS system tries to resolve it and if also not found, the lookup fails.

```
127.0.0.1  localhost loopback
::1        localhost
```

The example illustrates that an IP address may have multiple hostnames (localhost and loopback) and that a host name may be mapped to both IPv4 and IPv6 IP addresses, as shown on the first and second lines respectively. 

When we try to access localhost, then the computer will look up this file first and use `127.0.0.1` as the IP address. 

> Actually, we don't need to map localhost to our local IP address. Because localhost name resolution is handled within DNS itself. Therefore, we don't need to specify it in the hosts file.

Before involving the DNS system into play we can take some actions by configuring this file. Let's talk about the usage of the hosts file and see why we might want to add new mapping entries to the file.

## Usage of the hosts file

You can see the following table, for the possible reasons why we might want to configure the **hosts** file:

| Reason | Description |
|---|---|
| **Privacy** | It can be configured to block advertisers or third-party websites to protect your privacy. |
| **Blocking**  | We can block malicious websites. |
| **Development** | You can add a custom domain in the hosts file and test your applications through the domain you specified. |
| **Security** | It can be utilized as a firewall in a local system. |

Especially, it can be helpful for developers to test their applications before going on live. For example, some payment gateways require a hostname rather than the localhost, for this purpose we can configure the hosts file and easily test our payment gateway work as expected.

## Blocking websites

A short time ago, while testing an application to see if it's working, if an external server that it's used by the application, Github in my case, I needed to mock the Github as going offline.

I researched some possible solutions for this testing purpose. Then, I found the **hosts** file and see I can simply achieve this by configuring this file.

Thus, I open the **hosts** file under **\System32\drivers\etc\hosts** and added a new line to the file:

```
127.0.0.1 github.com
```

> After adding this line, save the file and run the "Windows Command Processor" to apply it for Windows. After you've saved the file, Windows automatically run the command processor so most of the time you don't need to run the windows command processor manually.

By doing that, I blocked GitHub. When I try to access github.com, the computer checks the hosts file and maps its IP address to my local IP address instead of mapping it to GitHub's IP address through the DNS system. 

![Github Connection Refused](/assets/images/hosts-article/github-connection-refused.png)

We can mock any website while testing our application with this kind of configuration.

---

Thanks for reading. See you in the next one :)
