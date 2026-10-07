const
 
{
 ethers 
}
 
=
 
require
(
"ethers"
)
;

const
 privateKey 
=
 
"67f16e174f49dbb663748fd758a43464e8bf942c73d8db467b63ef66351dc1f0"
;

const
 wallet 
=
 
new
 
ethers
.
Wallet
(
privateKey
)
;

console
.
log
(
"Your wallet address:"
,
 wallet
.
address
)
;