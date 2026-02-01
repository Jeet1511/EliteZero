import { EmbedBuilder } from 'discord.js';
import config from '../config.js';

// Premium embed builder with futuristic designs
class PremiumEmbedBuilder {
    // Create base embed with common styling
    createBase() {
        return new EmbedBuilder()
            .setFooter({
                text: config.footer.text,
                iconURL: config.footer.iconURL,
            })
            .setTimestamp();
    }

    // Success embed (green gradient)
    success(title, description) {
        return this.createBase()
            .setColor(config.colors.success)
            .setTitle(`${config.emojis.check} ${title}`)
            .setDescription(description);
    }

    // Error embed (red gradient)
    error(title, description) {
        return this.createBase()
            .setColor(config.colors.error)
            .setTitle(`${config.emojis.cross} ${title}`)
            .setDescription(description);
    }

    // Info embed (cyan gradient)
    info(title, description) {
        return this.createBase()
            .setColor(config.colors.primary)
            .setTitle(`${config.emojis.sparkles} ${title}`)
            .setDescription(description);
    }

    // Warning embed (orange gradient)
    warning(title, description) {
        return this.createBase()
            .setColor(config.colors.warning)
            .setTitle(`⚠️ ${title}`)
            .setDescription(description);
    }

    // Custom embed with gradient effect
    custom(title, description, color = config.colors.primary) {
        return this.createBase()
            .setColor(color)
            .setTitle(title)
            .setDescription(description);
    }

    // Premium embed with thumbnail and fields
    premium(options) {
        const embed = this.createBase()
            .setColor(options.color || config.colors.primary)
            .setTitle(options.title)
            .setDescription(options.description);

        if (options.thumbnail) embed.setThumbnail(options.thumbnail);
        if (options.image) embed.setImage(options.image);
        if (options.fields) {
            options.fields.forEach(field => {
                embed.addFields({
                    name: field.name,
                    value: field.value,
                    inline: field.inline || false,
                });
            });
        }
        if (options.author) {
            embed.setAuthor({
                name: options.author.name,
                iconURL: options.author.iconURL,
                url: options.author.url,
            });
        }
        if (options.footer) {
            embed.setFooter({ text: options.footer });
        }

        return embed;
    }

    // Loading embed
    loading(title, description) {
        return this.createBase()
            .setColor(config.colors.secondary)
            .setTitle(`${config.emojis.loading} ${title}`)
            .setDescription(description);
    }
}

export default new PremiumEmbedBuilder();
