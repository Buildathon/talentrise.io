import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { VAULT_ABI, VAULT_ADDRESS } from "../contracts/vaultInfo";
import { usdtAbi } from "../contracts/usdtAbi";
import talentsData from "../data/talents.json";

// Interfaz de talento
interface Talent {
  id: number;
  name: string;
  username: string;
  wallet: string;
  followers: string;
  posts: number;
  price: string;
  change: string;
  avatar: string;
  category: string;
}

// Aplicar la interfaz al JSON
const talents: Talent[] = talentsData as Talent[];

const TalentDonationPage = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [vaultContract, setVaultContract] = useState<ethers.Contract | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [harvestable, setHarvestable] = useState<{ [wallet: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  // Conectar wallet
  const connectWallet = async () => {
    if (!window.ethereum) return setMsg("❌ MetaMask no está instalado");

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();

      const network = await provider.getNetwork();
      if (network.chainId !== 11155111)
        return setMsg("⚠️ Conéctate a Sepolia Testnet en MetaMask");

      setAccount(address);
      const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
      setVaultContract(vault);
    } catch (err: any) {
      setMsg(`❌ Error al conectar wallet: ${err.message}`);
    }
  };

  // Depositamos mostrando 18 decimales
  const handleDeposit = async (wallet: string) => {
    if (!vaultContract || !account) return;
    if (!depositAmount || Number(depositAmount) <= 0)
      return setMsg("❌ Ingresa un monto válido");

    try {
      setLoading(true);

      // Convertimos a 18 decimales (USDT en tu Vault tiene 6, aquí lo hacemos más visual)
      const [integer, decimal] = depositAmount.split(".");
      const decimals = decimal?.padEnd(16, "0") || "0000000000000000";
      const amountStr = `${integer}${decimals}`;
      const parsedAmount = ethers.BigNumber.from(amountStr);

      const usdtAddress = await vaultContract.usdtToken();
      const usdt = new ethers.Contract(usdtAddress, usdtAbi, vaultContract.signer);

      await usdt.approve(VAULT_ADDRESS, parsedAmount);
      const tx = await vaultContract.depositForTalent(wallet, parsedAmount);
      await tx.wait();

      setMsg(`✅ Depósito exitoso: ${depositAmount} USDT`);
      setDepositAmount("");
      getHarvestable(wallet);
    } catch (err: any) {
      setMsg(`❌ ${err.message || "Error al depositar"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleHarvest = async (wallet: string) => {
    if (!vaultContract || !account) return;
    try {
      setLoading(true);
      const tx = await vaultContract.harvestAndDonate(wallet);
      await tx.wait();
      setMsg("🌱 Intereses cosechados y tokens entregados");
      getHarvestable(wallet);
    } catch (err: any) {
      setMsg(`❌ ${err.message || "Error al cosechar"}`);
    } finally {
      setLoading(false);
    }
  };

  const getHarvestable = async (wallet: string) => {
    if (!vaultContract || !account) return;
    try {
      const interest = await vaultContract.calculateHarvestableInterest(account, wallet);
      setHarvestable((prev) => ({
        ...prev,
        [wallet]: ethers.utils.formatUnits(interest, 6),
      }));
    } catch {
      setHarvestable((prev) => ({ ...prev, [wallet]: "0" }));
    }
  };

  useEffect(() => {
    if (vaultContract && account) {
      talents.forEach((t) => getHarvestable(t.wallet));
    }
  }, [vaultContract, account]);

  const filteredTalents = talents.filter(
    (t) =>
      (selectedCategory === "Todos" || t.category === selectedCategory) &&
      (t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-gradient-to-r from-purple-700 to-indigo-800 p-6 text-white flex flex-col items-center">
      <section className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold mb-6 text-center">Ranking</h1>

        {/* Categorías */}
        <nav className="flex justify-center mb-6 space-x-2 overflow-x-auto px-1">
          {["Todos", "Música", "Arte", "Deportes"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-white text-purple-700 shadow-lg"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar talento..."
          className="w-full p-3 mb-6 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Lista de talentos */}
        {filteredTalents.length === 0 ? (
          <p className="text-center text-gray-200">Sin resultados</p>
        ) : (
          <ul className="space-y-6">
            {filteredTalents.map((t) => (
              <li
                key={t.wallet}
                className="bg-gray-900 rounded-xl shadow-lg p-5 hover:shadow-purple-500/50 transition"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-16 h-16 rounded-full border-2 border-purple-500 object-cover"
                  />
                  <div className="flex-grow">
                    <p className="text-xl font-bold">{t.name}</p>
                    <p className="text-purple-300">@{t.username}</p>
                    <p className="text-sm text-gray-400">
                      {t.followers} seguidores • {t.posts} posts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{t.price}</p>
                    <p className={t.change.startsWith("+") ? "text-green-400" : "text-red-400"}>
                      {t.change}
                    </p>
                  </div>
                </div>

                {/* Info de cosecha */}
                {account && (
                  <p className="text-sm mt-2 text-yellow-300">
                    💰 Cosechable: {harvestable[t.wallet] || "0"} USDT
                  </p>
                )}

                {/* Acciones */}
                <div className="mt-4 flex flex-col gap-2">
                  {!account ? (
                    <button
                      onClick={connectWallet}
                      className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 font-semibold"
                    >
                      Conectar Wallet
                    </button>
                  ) : (
                    <>
                      <input
                        type="number"
                        placeholder="Monto en USDT"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full p-2 rounded text-black"
                        min="0"
                      />
                      <button
                        onClick={() => handleDeposit(t.wallet)}
                        disabled={loading}
                        className="bg-green-600 py-2 rounded hover:bg-green-700"
                      >
                        Depositar
                      </button>
                      <button
                        onClick={() => handleHarvest(t.wallet)}
                        disabled={loading || harvestable[t.wallet] === "0"}
                        className="bg-purple-500 py-2 rounded hover:bg-purple-600"
                      >
                        Cosechar y donar
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Mensaje global */}
        {msg && <p className="text-center mt-6 text-yellow-300">{msg}</p>}
      </section>
    </main>
  );
};

export default TalentDonationPage;
