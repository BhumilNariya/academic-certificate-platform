// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CertificateRegistry {
    struct Certificate {
        string certificateId;
        string ipfsHash;
        address issuer;
        uint256 issuedAt;
    }

    mapping(string => Certificate) public certificates;
    event CertificateIssued(string certificateId, string ipfsHash, address issuer, uint256 issuedAt);

    function issueCertificate(string memory certificateId, string memory ipfsHash) public {
        require(bytes(certificateId).length > 0, "Invalid ID");
        require(bytes(certificates[certificateId].certificateId).length == 0, "Already exists");

        certificates[certificateId] = Certificate({
            certificateId: certificateId,
            ipfsHash: ipfsHash,
            issuer: msg.sender,
            issuedAt: block.timestamp
        });

        emit CertificateIssued(certificateId, ipfsHash, msg.sender, block.timestamp);
    }

    function getCertificate(string memory certificateId) public view returns (string memory, string memory, address, uint256) {
        Certificate storage c = certificates[certificateId];
        return (c.certificateId, c.ipfsHash, c.issuer, c.issuedAt);
    }
}
