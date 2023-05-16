// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MintReservableNFT is Ownable, ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public immutable mintPrice;
    uint256 public immutable targetResarvation;

    event MintReserved(address user);
    event ReservationCanceled(address user);

    mapping(address => uint256) public userReservation;
    uint256 public reserved;

    function hasAchieved() public view returns (bool) {
        return reserved >= targetResarvation;
    }

    modifier onlyAchieved() {
        require(hasAchieved(), "Mint target not achieved");
        _;
    }

    modifier onlyNotAchieved() {
        require(!hasAchieved(), "Mint target achieved");
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _mintPrice,
        uint256 _targetReservation
    ) ERC721(_name, _symbol) {
        mintPrice = _mintPrice;
        targetResarvation = _targetReservation;
    }

    function reserveMint() external payable onlyNotAchieved {
        require(msg.value == mintPrice, "Invalid value");
        reserved += 1;
        userReservation[msg.sender] += 1;
        emit MintReserved(msg.sender);
    }

    function mint() external onlyAchieved {
        require(userReservation[msg.sender] > 0, "Not reserved");

        userReservation[msg.sender] -= 1;
        _mint(msg.sender, _tokenIds.current());
        _tokenIds.increment();
    }

    function cancelReservation() external onlyNotAchieved {
        require(userReservation[msg.sender] > 0, "Not reserved");

        userReservation[msg.sender] -= 1;
        reserved -= 1;

        (bool success, ) = msg.sender.call{value: mintPrice}("");
        require(success, "Failed to return value");

        emit ReservationCanceled(msg.sender);
    }

    function withdraw(
        address payable _to,
        uint256 _balance
    ) external onlyOwner onlyAchieved {
        (bool success, ) = _to.call{value: _balance}("");
        require(success, "Failed to withdraw");
    }
}
