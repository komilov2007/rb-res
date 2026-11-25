import type { OfertaProps } from '@/types/oferta'

export const EN = (props: OfertaProps) => {
	return (
		<div style={{ padding: '16px', fontSize: '14px' }}>
			<h1
				style={{
					textAlign: 'center',
					fontSize: '24px',
					fontWeight: 'bold',
					marginBottom: '20px',
				}}
			>
				{props.name}
			</h1>
			<h2
				style={{
					textAlign: 'center',
					fontSize: '20px',
					fontWeight: '600',
					marginBottom: '16px',
				}}
			>
				PUBLIC OFFER
			</h2>
			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					1. GENERAL PROVISIONS
				</h3>
				<p style={{ marginBottom: '8px' }}>
					1.1. This document is the official public offer of the company {props.name} (hereinafter
					referred to as the &quot;Online Store&quot;) and contains all the essential terms for ordering,
					selling, and delivering goods and/or services to the Buyer.
				</p>
				<p style={{ marginBottom: '8px' }}>
					1.2. In accordance with Article 369 of the Civil Code of the Republic of Uzbekistan, a
					person who accepts the terms of this offer and pays for the goods and/or services is
					considered to have accepted the offer (hereinafter referred to as the Buyer), and the
					Online Store and the Buyer become parties to the Offer Agreement.
				</p>
				<p style={{ marginBottom: '8px' }}>
					1.3. In view of the foregoing, please carefully read the text of this offer. If you do not
					agree with its terms or are not ready to fulfill the conditions stipulated in the offer,
					the Online Store suggests refraining from concluding the Offer Agreement and using the
					services of the Online Store through entering into a direct agreement.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					2. TERMS
				</h3>
				<p style={{ marginBottom: '8px' }}>
					2.1. For the purposes of this Offer, the following terms are used with the meanings
					specified:
				</p>
				<ul
					style={{
						marginBottom: '8px',
						paddingLeft: '8px',
						listStyleType: 'disc',
					}}
				>
					<li style={{ marginBottom: '8px' }}>
						&quot;Offer&quot; — this document, representing a public proposal to conclude a sales agreement,
						according to which one Party (Online Store) undertakes to transfer Goods into ownership
						and/or provide Services to the other Party (Buyer), and the Buyer undertakes to accept
						the specified Goods and/or Services and pay their cost as determined by the Online
						Store.
					</li>
					<li style={{ marginBottom: '8px' }}>
						&quot;Acceptance of the Offer&quot; — full and unconditional acceptance of this Offer by
						performing the actions specified in section 4 of this Offer. Acceptance of the Offer
						implies entering into an agreement on the terms provided in this Offer.
					</li>
					<li style={{ marginBottom: '8px' }}>
						&quot;Offer Agreement&quot; — a sales agreement concluded between the Buyer and the Online Store
						by accepting the terms of this Offer.
					</li>
					<li style={{ marginBottom: '8px' }}>
						&quot;Buyer&quot; — an individual who has accepted this Offer and placed an order for Goods and/or
						Services through the website at https://click.robosell.uz/{props.slug}.
					</li>
					<li style={{ marginBottom: '8px' }}>
						&quot;Online Store&quot; — the seller of Goods and/or Services, engaged in their sale and delivery
						to the Buyer.
					</li>
					<li style={{ marginBottom: '8px' }}>
						&quot;Goods&quot; — food products, other goods, and/or services available for order through the
						website at https://click.robosell.uz/{props.slug}.
					</li>
				</ul>
				<p style={{ marginBottom: '8px' }}>
					2.2. Terms not defined in clause 2.1 of this Offer may be used herein. In such cases, the
					interpretation of such terms shall be carried out in accordance with the text of this
					Offer. If the term is not explicitly interpreted in the text of the Offer, its meaning
					shall be determined based on its interpretation on the Online Store&apos;s website, or
					otherwise in accordance with its general usage on the Internet.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					3. SUBJECT OF THE AGREEMENT
				</h3>
				<p style={{ marginBottom: '8px' }}>
					3.1. The subject of this Offer is the sale of Goods and/or Services to the Buyer in
					accordance with the terms and prices specified on the website at
					https://click.robosell.uz/{props.slug}, as well as the payment and acceptance of these
					Goods and/or Services by the Buyer under the terms of this agreement.
				</p>
				<p style={{ marginBottom: '8px' }}>
					3.2. The public offer is an official document and is published on the online store&apos;s
					website.
				</p>
				<p style={{ marginBottom: '8px' }}>
					3.3. The online store has the right to change the prices of Goods and/or Services, the
					terms of this Public Offer, and any amendments to it without prior agreement with the
					Buyer, provided that such changes are announced on the online store&apos;s website and made
					available in an open-access location for review at least one day before they take effect.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					4. ACCEPTANCE OF THE OFFER AND CONCLUSION OF THE OFFER AGREEMENT
				</h3>
				<p style={{ marginBottom: '8px' }}>
					4.1. The Buyer accepts the Offer by making payment for the Goods and/or Services, which
					signifies the conclusion of a retail sales agreement under the terms specified in this
					Offer.
				</p>
				<p style={{ marginBottom: '8px' }}>
					The agreement is considered concluded from the moment the Buyer receives a receipt or
					other document confirming payment for the Goods and/or Services (including, but not
					limited to, a bank confirmation of payment made by the Buyer using a bank card) or from
					the moment the Seller receives notification of the Buyer&apos;s intention to purchase the Goods
					and/or Services.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					5. DESCRIPTION OF SERVICES
				</h3>
				<p style={{ marginBottom: '8px' }}>
					5.1. The online store is an information system designed for searching, ordering, and
					paying for goods and/or services offered by the Seller to the Buyer.
				</p>
				<p style={{ marginBottom: '8px' }}>
					5.2. If the ordered goods and/or services are unavailable at the time of order acceptance,
					the Seller’s employee has the right to agree with the Buyer on a replacement of the goods
					and/or services or exclude the unavailable goods and/or services.
				</p>
				<p style={{ marginBottom: '8px' }}>
					5.3. When placing an order for delivery, a delivery service representative contacts the
					Buyer using the contact method specified when placing the order.
				</p>
				<p style={{ marginBottom: '8px' }}>
					5.4. Goods delivery is carried out within Uzbekistan to the address specified by the Buyer
					during order placement and is considered completed upon confirmation of delivery by the
					Seller. Delivery is performed on the date and time agreed upon with the Buyer. Delivery
					confirmation is conducted by the Seller over the phone.
				</p>
				<p style={{ marginBottom: '8px' }}>
					5.5. The Buyer agrees to receive calls, SMS, and emails from the Seller&apos;s operators and
					couriers, as well as from the delivery service, to the phone numbers provided during
					registration and/or order placement. The Buyer also agrees to accept the ordered Goods
					from the delivery service employee or authorized person at the address provided during
					registration and/or order placement.
				</p>
				<p style={{ marginBottom: '8px' }}>
					5.6. When placing an order, the Buyer must provide the most accurate information about
					their location at the specified address and ensure free and unobstructed access for the
					delivery service employee or authorized person to the specified address.
				</p>
				<p style={{ marginBottom: '8px' }}>
					5.7. All materials presented in the online store are intended solely for informational
					purposes and may not always fully and reliably convey the characteristics of goods and/or
					services. Information about the consumer properties of goods (nutritional and energy
					value, storage conditions, composition, etc.) is based on data provided by the suppliers
					of goods and/or services. The Seller and manufacturer are not responsible for
					discrepancies between the information and the actual characteristics of the goods. The
					expiration dates of the delivered goods and their components are indicated on the
					packaging. The Seller and manufacturer are not liable for damage caused by the Buyer’s
					violation of the storage conditions and periods of the purchased goods and ingredients.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					6. TERMS AND PROCEDURES FOR SERVICE PROVISION
				</h3>
				<p style={{ marginBottom: '8px' }}>
					6.1. To place an order in the online store, the Buyer fills out contact details, thereby
					confirming familiarity with this Offer and agreeing to provide accurate and complete
					information about themselves in the proposed forms.
				</p>
				<p style={{ marginBottom: '8px' }}>
					6.2. If the Buyer provides incorrect information, or if the online store or the Seller has
					reasonable grounds to believe that the provided information is incorrect, incomplete, or
					erroneous, the online store has the right to suspend the Buyer&apos;s access to its services.
				</p>
				<p style={{ marginBottom: '8px' }}>
					6.3. The Buyer agrees that the information provided, which may include their personal
					data, will be used by the online store and the Seller&apos;s subdivisions for the processing
					and fulfillment of orders. The online store and Seller process personal data in accordance
					with the Law of the Republic of Uzbekistan &quot;On Personal Data.&quot; The Seller undertakes to
					take all measures to protect the received personal data and not transfer it to third
					parties, except when such transfer is necessary to fulfill the Seller&apos;s obligations to the
					Buyer under this Agreement.
				</p>
				<p style={{ marginBottom: '8px' }}>
					6.4. By providing their phone number and email address, the Buyer agrees to receive
					informational SMS and email messages from the Seller or the online store owner.
				</p>
				<p style={{ marginBottom: '8px' }}>
					6.5. After reviewing the list of goods and/or services posted on the online store&apos;s
					website at https://click.robosell.uz/{props.slug} and selecting the type of goods and/or
					services, the Buyer places an order.
				</p>
				<p style={{ marginBottom: '8px' }}>
					6.6. If the Buyer does not submit written claims regarding unused goods and/or services
					within three days from the date of service provision, the goods are considered accepted
					without claims, and the services are deemed provided correctly and in full. In the absence
					of written claims, it is considered that the act of acceptance and delivery of completed
					work (services) has been signed, and the services have been provided properly.
				</p>
				<p style={{ marginBottom: '8px' }}>
					6.7. After the services are provided under this Agreement, the parties have no claims
					against each other.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					7. SERVICE COST AND PAYMENT PROCEDURE
				</h3>
				<p style={{ marginBottom: '8px' }}>
					7.1. Delivery costs for purchased goods and/or services, as well as payment methods, are
					specified in the relevant sections of the website https://click.robosell.uz/{props.slug}.
					By placing an order, the Buyer confirms their awareness of the prices for Goods and/or
					Services, as well as the delivery costs of the Goods, and agrees to pay them.
				</p>
				<p style={{ marginBottom: '8px' }}>
					7.2. Payment is made by the Buyer via online payment on the website https://click.uz.
				</p>
				<p style={{ marginBottom: '8px' }}>
					7.3. Upon receiving the goods and/or services and their payment, the Buyer is obliged to
					accept or refuse the order (or part of it) by signing the accompanying documents
					indicating the amounts paid.
				</p>
				<p style={{ marginBottom: '8px' }}>
					7.4. The Buyer must pay the cost of the Goods and/or Services at the price valid at the
					time of their acceptance, as well as the delivery and packaging costs, including all
					applicable taxes.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					8. RETURN OF GOODS OR FUNDS
				</h3>
				<p style={{ marginBottom: '8px' }}>
					8.1. The Buyer has the right to refuse to receive the ordered Goods at any time, but no
					later than 24 hours before the agreed delivery time (&quot;Order Fulfillment Time&quot;). The time
					of transferring the goods to the Seller&apos;s courier is considered the order fulfillment
					time, which is confirmed by a note on the sales receipt. If payment was made by bank card,
					the funds will be returned to the same card used for payment. The Buyer is not entitled to
					refuse an Order (or part of it) of proper quality that has been paid for. Goods of proper
					quality are not subject to exchange or return.
				</p>
				<p style={{ marginBottom: '8px' }}>
					8.2. The Buyer has the right to modify the order in agreement with the Seller. Such
					modifications must be made no later than 24 hours before the agreed delivery time. If
					payment was made by non-cash means, the Seller adjusts the payment by refunding part of
					the funds to the Buyer&apos;s account or issuing a request for additional payment.
				</p>
				<p style={{ marginBottom: '8px' }}>
					8.3. If the goods were delivered to the address specified in the order and on time, but
					were not handed over to the Buyer for reasons beyond the Seller&apos;s control (e.g., the
					Buyer&apos;s refusal of goods of proper quality; provision of an incorrect address by the
					Buyer; absence of an authorized person to accept the goods at the specified address within
					15 minutes of the agreed time; no response to calls made to the phone number provided
					during the order, etc.), the Seller is entitled to demand full compensation from the Buyer
					for the returned goods. In the case of non-cash payment, the Seller does not refund the
					money. If the payment was to be made in cash, the Seller has the right to demand full
					payment for the unaccepted goods from the Buyer.
				</p>
				<p style={{ marginBottom: '8px' }}>
					8.4. If defects are found in the goods, the Buyer has the right, at their discretion, to
					demand a replacement of such goods with goods of proper quality or a proportional
					reduction in the purchase price. Instead of presenting such demands, the Buyer also has
					the right to refuse the purchased goods and demand a refund of the amount paid for the
					goods. In this case, the Buyer is obliged, at the Seller&apos;s request and at the Seller&apos;s
					expense, to return the defective goods.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					9. TERMS OF USE OF MATERIALS PUBLISHED ON THE ONLINE STORE
				</h3>
				<p style={{ marginBottom: '8px' }}>
					9.1. The online store contains materials protected by copyright, trademarks, and other
					legally protected materials, including but not limited to: texts, photographs, and graphic
					images.
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.2. The online store holds exclusive rights to use the published materials (including
					rights to selection, arrangement, editing, and modification of information, as well as to
					original data and materials), unless otherwise explicitly stated in the materials posted
					on the website.
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.3. The Buyer, as well as any person visiting the online store&apos;s website, is not entitled
					to modify, publish, transfer to third parties, sell, or participate in the transfer of,
					create derivative products, or use the content of the online store, in whole or in part,
					without prior agreement with the online store. Any actions related to organizing,
					collecting, compiling, translating, digitizing, or otherwise using materials, as well as
					copying, redistributing, or publishing them, in whole or in part, without permission from
					the online store, are prohibited.
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4. The Buyer, as well as any person visiting the online store&apos;s website, agrees not to
					place on the pages of the online store or send through it the following materials:
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4.1. Materials that violate the law, contain threats or insults, slander, or defame the
					honor of others;
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4.2. Materials that infringe on citizens&apos; privacy or public order, or contain
					obscenities;
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4.3. Materials that in any way infringe on the honor, dignity, rights, or legally
					protected interests of others;
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4.4. Materials inciting religious, racial, or national hatred, containing such appeals
					or provoking violence;
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4.5. Materials calling for illegal actions, bearing criminal, civil, or other liability,
					containing advertisements for goods and/or services without prior consent from the online
					store, or promoting subscriptions to other interactive service systems without written
					consent.
				</p>
				<p style={{ marginBottom: '8px' }}>
					9.4.6. The Buyer, as well as any person visiting the online store&apos;s website, agrees not to
					upload, place, or use on the online store&apos;s pages any materials protected by intellectual
					property laws (including copyright and trademark laws) or other legally protected
					materials without the explicit consent of the rights holder. At the same time, the
					obligation to prove that the materials placed do not violate copyright or other rights of
					third parties rests with the Buyer.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					10. OBLIGATIONS OF THE PARTIES
				</h3>
				<p style={{ marginBottom: '8px' }}>10.1. The online store undertakes to:</p>
				<p style={{ marginBottom: '8px' }}>
					10.1.1. Ensure the acceptance of the order, receipt of payment, and delivery in accordance
					with the terms of this Offer;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.1.2. Deliver the goods and necessary accessories in the agreed quantity and assortment
					to the address specified in the order;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.1.3. Comply with the Buyer&apos;s instructions regarding the provision of services under
					this Agreement;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.1.4. Ensure the confidentiality of the Buyer&apos;s data, except as provided by the
					legislation of the Republic of Uzbekistan;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.1.5. Provide quality services, take measures to prevent and resolve quality issues with
					the provided services, and promptly inform the Buyer of changes in the services provided
					and their conditions.
				</p>
				<p style={{ marginBottom: '8px' }}>10.2. The online store has the right to:</p>
				<p style={{ marginBottom: '8px' }}>
					10.2.1. Engage third parties to provide services to the Buyer while remaining responsible
					to the Buyer for their performance;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.2.2. Refuse to deliver goods and/or provide services in case the Buyer fails to fulfill
					their obligations under this Agreement;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.2.3. Request clarifications and additional information on issues arising in the course
					of service provision;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.2.4. Unilaterally terminate this Agreement in case of the Buyer&apos;s failure to meet the
					obligations specified in clause 6.2 (timely payment for services);
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.2.5. Delegate the authority to fulfill this Offer to third parties without prior notice
					to or agreement with the Buyer.
				</p>
				<p style={{ marginBottom: '8px' }}>10.3. The Buyer undertakes to:</p>
				<p style={{ marginBottom: '8px' }}>
					10.3.1. Timely pay for the online store&apos;s services in accordance with the terms of this
					Offer;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.3.2. Comply with all requirements set forth in this Offer, respond to questions arising
					during the provision of services, and provide the necessary information.
				</p>
				<p style={{ marginBottom: '8px' }}>10.4. The Buyer has the right to:</p>
				<p style={{ marginBottom: '8px' }}>
					10.4.1. Receive the goods and/or services in accordance with the terms of this Offer;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.4.2. Obtain necessary and reliable information about the online store&apos;s activities and
					the services provided;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.4.3. Submit opinions, suggestions, and recommendations to the online store;
				</p>
				<p style={{ marginBottom: '8px' }}>
					10.4.4. Monitor the process of executing this Agreement at any time, without interfering
					in the economic activities of the online store.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					11. LIABILITY OF THE PARTIES
				</h3>
				<p style={{ marginBottom: '8px' }}>
					11.1. The online store is not liable for damages caused to the Buyer&apos;s activities if the
					Buyer or persons representing their interests improperly fulfill their obligations under
					this Agreement or violate the requirements of the online store&apos;s employees.
				</p>
				<p style={{ marginBottom: '8px' }}>
					11.2. By paying for the online store&apos;s services under this Offer, the Buyer agrees that
					during the term of this Agreement, as well as after its termination, they are not entitled
					to claim compensation for moral, material damages, or losses incurred by the Buyer, except
					in cases explicitly provided by law.
				</p>
				<p style={{ marginBottom: '8px' }}>
					11.3. Under no circumstances does the online store bear responsibility under this Offer
					for:
				</p>
				<p style={{ marginBottom: '8px' }}>
					a) any actions and/or inactions of third parties not engaged by the online store, which
					result in direct or indirect losses;
				</p>
				<p style={{ marginBottom: '8px' }}>
					b) indirect losses and/or lost profits of the Buyer and/or third parties, regardless of
					whether the online store could foresee the possibility of such losses.
				</p>
				<p style={{ marginBottom: '8px' }}>
					11.4. This Offer, its conclusion, and execution are governed by the current legislation of
					the Republic of Uzbekistan.
				</p>
				<p style={{ marginBottom: '8px' }}>
					11.5. If negative consequences arise for one Party due to the improper performance of
					obligations by the other Party, liability is established in accordance with the
					legislation of the Republic of Uzbekistan.
				</p>
				<p style={{ marginBottom: '8px' }}>
					11.6. CLICK does not assume responsibility for any disputes, and CLICK operators are not
					obligated to participate in their resolution. Additionally, CLICK is not responsible for
					the quality of services provided by the supplier.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					12. CONFIDENTIALITY
				</h3>
				<p style={{ marginBottom: '8px' }}>
					12.1. The Parties agree not to disclose to third parties or use in any other way not
					provided for by the terms of the Agreement any organizational, technological, commercial,
					financial, or other information constituting the trade secret of one of the Parties, if
					such information has actual or potential commercial value due to its unknown status to
					third parties.
				</p>
				<p style={{ marginBottom: '8px' }}>
					12.2. The term for protecting confidential information is set to a minimum of one year
					from the date of the Offer&apos;s expiration.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					13. OTHER CONDITIONS
				</h3>
				<p style={{ marginBottom: '8px' }}>
					13.1. Any notifications under this Offer may be sent by one Party to the other Party as
					follows: if the recipient of the notification is the Buyer, to the email address specified
					at the end of this Offer or to the email address provided by the Buyer when placing an
					order for services; if the recipient is the Online Store, from the Buyer&apos;s email address
					provided at the time of inquiry, to the Online Store&apos;s email address specified at the end
					of this Offer.
				</p>
				<p style={{ marginBottom: '8px' }}>
					13.2. This Offer constitutes the entire agreement between the Online Store and the Buyer.
					The Online Store bears no obligations other than those explicitly stated in this Offer,
					except in cases where such obligations are documented in writing and signed by authorized
					representatives of the Online Store and the Buyer. If any terms of the annexes or
					additional agreements to the Offer contradict the provisions of this Offer, the provisions
					of the Offer shall prevail.
				</p>
			</section>

			<section style={{ marginBottom: '16px' }}>
				<h3
					style={{
						fontSize: '18px',
						fontWeight: '600',
						marginBottom: '8px',
					}}
				>
					14. ADDRESSES AND BANK DETAILS OF THE PARTIES
				</h3>
				<p style={{ marginBottom: '8px' }}>
					LLC &quot;{props.name}&quot;
					<br />
					Address:{props.address}
					<br />
					Phone: {props.phone}
					<br />
					TIN: {props.tin_or_pinfl}
					<br />
					Bank Code: {props.mfo}
					<br />
					Account No.: {props.bank_account}
					<br />
				</p>
			</section>
		</div>
	)
}
