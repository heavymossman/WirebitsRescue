pragma solidity ^0.4.21; //setting to .21 so it complies in My Ether Wallet

contract WirebitsToken {
    string  public name = "Wirebits";
    string  public symbol = "WBITS";
    string  public standard = "Wirebits ERC20 Token v1.0";
    uint256 public totalSupply;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    //Standard mapping. Takes the address as assigns an integar
    mapping(address => uint256) public balanceOf;
    //Keeps track of the spending mapping, which tokens to to where, and so forth
    mapping(address => mapping(address => uint256)) public allowance;

    //This is effectively the entire currency
    function WirebitsToken (uint256 _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    // Standard transfer function, keeps track of the balance and uses the public variables
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);

        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

    //Approve certain accounts or exchanges to seel X amount of tokens etc. Not needed for ICO but for compliance
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);

        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        allowance[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);

        return true;
    }
}
