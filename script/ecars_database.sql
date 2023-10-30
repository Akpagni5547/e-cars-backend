-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:8889
-- Généré le : lun. 21 nov. 2022 à 16:45
-- Version du serveur :  5.7.34
-- Version de PHP : 7.4.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `ecars_database`
--

-- --------------------------------------------------------

--
-- Structure de la table `car`
--

CREATE TABLE `car` (
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `id` int(11) NOT NULL,
  `model` varchar(255) NOT NULL,
  `brand` varchar(255) NOT NULL,
  `year` int(11) NOT NULL,
  `motor` varchar(255) NOT NULL,
  `mileage` varchar(255) NOT NULL,
  `box` varchar(255) NOT NULL,
  `price_with_driver` int(11) NOT NULL,
  `price_no_driver` int(11) NOT NULL,
  `image1` varchar(255) NOT NULL,
  `image2` varchar(255) NOT NULL,
  `image3` varchar(255) NOT NULL,
  `image4` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `createById` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `client`
--

CREATE TABLE `client` (
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `request`
--

CREATE TABLE `request` (
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `id` varchar(36) NOT NULL,
  `outOfDate` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `comeBackDate` datetime(6) DEFAULT CURRENT_TIMESTAMP(6),
  `state` varchar(255) NOT NULL,
  `carId` int(11) DEFAULT NULL,
  `clientId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------



-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `salt` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`createdAt`, `updatedAt`, `deletedAt`, `id`, `username`, `email`, `lastname`, `firstname`, `password`, `salt`, `role`) VALUES
('2022-11-21 16:43:42.257641', '2022-11-21 16:44:26.467260', NULL, 1, 'arthur2', 'helios@gmail.com', 'admin', 'admin', '$2b$10$cm2U7yWd5y3/.IxQz26HJ.a8xDVUhiF.YAXTxoBeVrV3i2U0JAWLW', '$2b$10$cm2U7yWd5y3/.IxQz26HJ.', 'admin');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `car`
--
ALTER TABLE `car`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_cc23631967990cd203b4b47b283` (`createById`);



--
-- Index pour la table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `request`
--
ALTER TABLE `request`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_e2a9df3260e27c8b49be05bf9fc` (`carId`),
  ADD KEY `FK_df30188ff79f9f7637e159a739f` (`clientId`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_78a916df40e02a9deb1c4b75ed` (`username`),
  ADD UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `car`
--
ALTER TABLE `car`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `client`
--
ALTER TABLE `client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;



--
-- AUTO_INCREMENT pour la table `request`
--
ALTER TABLE `request`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `car`
--
ALTER TABLE `car`
  ADD CONSTRAINT `FK_cc23631967990cd203b4b47b283` FOREIGN KEY (`createById`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Contraintes pour la table `request`
--
ALTER TABLE `request`
  ADD CONSTRAINT `FK_df30188ff79f9f7637e159a739f` FOREIGN KEY (`clientId`) REFERENCES `client` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_e2a9df3260e27c8b49be05bf9fc` FOREIGN KEY (`carId`) REFERENCES `car` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;




ALTER TABLE `request`
  ADD COLUMN `isDriver` BOOLEAN DEFAULT false,
  ADD COLUMN `isGoOutCity` BOOLEAN DEFAULT false,
  ADD COLUMN `isDelivery` BOOLEAN DEFAULT false;


-- Étape 1 : Supprimer la clé primaire existante
ALTER TABLE `request` DROP PRIMARY KEY;

-- Étape 2 : Modifier le type de la colonne `id` en UUID
ALTER TABLE `request` MODIFY COLUMN `id` VARCHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL;

-- Étape 3 : Ajouter la nouvelle clé primaire
ALTER TABLE `request` ADD PRIMARY KEY (`id`);

--
-- Structure de la table `transaction`
--
-- Nouvelle configuration a faire
CREATE TABLE `transaction` (
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `deletedAt` datetime(6) DEFAULT NULL,
  `id` int(11) NOT NULL,
  `requestId` VARCHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  `amount` decimal(10, 2) NOT NULL,
  `lang` varchar(10) NOT NULL,
  `currency` varchar(10) NOT NULL,
  `channel` varchar(255) NOT NULL,
  `reference` varchar(255) NOT NULL,
  `country_code` varchar(10) NOT NULL,
  `response` TEXT,
  `status` enum('pending','succes', 'failed') NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Index pour la table `transaction`
--
ALTER TABLE `transaction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_request_id` (`requestId`);

--
-- AUTO_INCREMENT pour la table `transaction`
--
ALTER TABLE `transaction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour la table `transaction`
--

ALTER TABLE `transaction`
   ADD CONSTRAINT `FK_request_id` FOREIGN KEY (`requestId`) REFERENCES `request` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;


ALTER TABLE `request`
  ADD COLUMN `statusPayment` varchar(255) NOT NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

/*
ALTER TABLE `transaction`
   ADD CONSTRAINT `FK_request_id` FOREIGN KEY (`requestId`) REFERENCES `request` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

   ALTER TABLE `transaction` MODIFY COLUMN `requestId`varchar(36) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL;


ALTER TABLE `transaction` DROP PRIMARY KEY;

ALTER TABLE `transaction` ADD PRIMARY KEY (`id`);

ALTER TABLE `transaction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `transaction`
  ADD KEY `FK_request_id` (`requestId`);


ALTER TABLE `request` ADD PRIMARY KEY (`id`);
*/