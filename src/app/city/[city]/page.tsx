'use client'
import React from "react";
import { usePathname } from "next/navigation";
import './City.css';

const City = () => {
    const city = decodeURIComponent(usePathname().substring(6));
    let cityName = city.split(' ')[0] + ' ' + city.split(' ')[1];
    let cityPrice = city.split(' ')[2];
	return (
        <div className="w-full city pt-16 px-36 bg-blue-300">
            <div className="text-center text-3xl">{cityName}</div>
            <div className="text-center text-2xl mt-5">Price: {cityPrice}</div>
            <div className="flex">
                <div className="mt-10 text-xl">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Consequuntur ad, delectus perferendis, maxime atque dolore quaerat alias sequi nemo fugiat adipisci provident reiciendis reprehenderit nam perspiciatis iusto praesentium voluptate cupiditate!
                Fugiat iure quas voluptatibus voluptatem eligendi, maxime aliquid explicabo atque animi tempore fuga reprehenderit ratione illum, velit molestias repudiandae autem non obcaecati dolores nisi repellat! Animi dicta repellat totam voluptatum?
                Eaque veritatis debitis exercitationem iste et perferendis quis voluptas laudantium, officiis explicabo impedit magnam possimus, reprehenderit quos nobis. Odit cum laudantium magni, cupiditate modi reiciendis? Eius repudiandae animi voluptas reiciendis!
                Optio omnis veritatis, quas blanditiis sed asperiores velit nam eaque numquam illo harum eveniet fugit facere consequatur veniam aliquam maxime error itaque nisi eum adipisci? Harum neque repudiandae porro qui.
                Doloremque facilis ipsam aspernatur eaque laudantium deserunt tenetur labore! Deserunt vel exercitationem, nostrum quo animi corrupti fugiat laboriosam quas rem libero id quod cupiditate ea fugit doloribus itaque odit cum.
                Aspernatur sed facere qui dolores asperiores nesciunt quia libero, repellat quasi iure unde, corrupti iste perspiciatis? Cumque, porro illo? Corporis odit blanditiis odio esse temporibus molestiae inventore dolorem quasi voluptates.
                Odio, unde deleniti doloremque, sed possimus adipisci, autem odit velit modi aliquid recusandae nisi repellendus! Molestiae labore saepe alias hic quia asperiores dolor nostrum! Pariatur impedit perspiciatis iure fugiat sequi.
                Ratione placeat dolorem et, excepturi repellendus a laboriosam ab suscipit exercitationem distinctio eaque reprehenderit in veritatis aliquid, corporis id magni illum mollitia voluptatibus earum minima commodi? Iure quaerat iste soluta?
                Quod quo sed labore libero quis doloribus nemo voluptatem neque repudiandae quaerat iusto nulla exercitationem placeat cumque reprehenderit laboriosam delectus corporis id nihil sequi, facere, in quae. Dolorem, inventore esse.
                Fugit magnam officiis accusamus rem obcaecati, voluptatibus, magni similique tenetur doloribus nisi maxime. Laudantium dolorem saepe deserunt amet aliquam impedit, facere ipsum dolore, sed quo officia enim? Et, accusamus autem?</div>
            </div>
        </div>
    );
};

export default City;
